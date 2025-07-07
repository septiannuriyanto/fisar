const { app, BrowserWindow, Tray, Menu, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { downloadFileFromFtp } = require("./dist/utils/ftpClient"); // Import download function
const { copy17Ra, copy221 } = require("./dist/utils/fileClient"); // Import download function
const {
  sendFilterUsageReminder,
} = require("./dist/reminders/grupGLFaoReminder"); // Import download function
const {
  checkAndNotifyPoFuelSummaryTest,
} = require("./dist/jobs/checkAndNotifyPoFuelSummary"); // Import download function


const { sendQRViaMailjet } = require("./dist/utils/mailJet"); // Import QR sender function

const QRCode = require("qrcode");

let tray = null;
let mainWindow = null;
let botProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    skipTaskbar: true,
    icon: path.join(__dirname, "icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile("renderer.html");

  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

function startBot() {
  if (!botProcess) {
    botProcess = spawn("node", ["dist/index.js"], {
      cwd: __dirname,
      shell: true,
    });

    botProcess.stdout.on("data", (data) => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send("bot-log", data.toString());
      }
    });

    botProcess.stderr.on("data", (data) => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send("bot-log", `[ERROR] ${data.toString()}`);
      }
    });

    botProcess.on("close", (code) => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send("bot-log", `[BOT CLOSED] Code ${code}\n`);
      }
      botProcess = null;
      stopBot();
      setTimeout(() => {
        startBot(); // Restart bot after 2 seconds
        // coldRestartBot(); // Restart bot after 2 seconds
      }, 2000); // 2000 milliseconds = 2 seconds
    });
  }
}

function stopBot() {
  if (botProcess) {
    botProcess.kill();
    botProcess = null;
  }
}

function createTray() {
  tray = new Tray(path.join(__dirname, "icon.ico"));
  tray.setToolTip("ARLIDA BOT");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Tampilkan Window",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: "Keluar",
      click: () => {
        stopBot();
        tray.destroy();
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function deleteAuthFolder() {
  const fs = require("fs");
  const authFolderPath = path.join(__dirname, "auth");
  if (fs.existsSync(authFolderPath)) {
    fs.rm(authFolderPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error("❌ Failed to delete auth folder:", err);
      } else {
        console.log("✅ Auth folder deleted successfully.");
      }
    });
  }
}

// function coldRestartBot() {
//   console.log("🔄 Cold restarting bot...");
//   // Buat QR code file

//   stopBot();
//   deleteAuthFolder(); // Hapus folder auth
//   setTimeout(() => {
//     startBot();
//   }, 2000); // 2000 milliseconds = 2 seconds

//   const qrText = `TESTING QR CODE BOSS`;
//   const filePath = path.join(__dirname, "qrcode.png");
//   QRCode.toFile(filePath, qrText, {}, (err) => {
//     if (err) return console.error(err);
//     sendQRViaMailjet(filePath);
//   });

//   return;

 
// }

// ===== IPC COMMUNICATION =====

ipcMain.on("toggle-bot", (event, shouldStart) => {
  shouldStart ? startBot() : stopBot();
});

ipcMain.on("cold-restart", () => {
  stopBot();
  setTimeout(() => {
    startBot();
  }, 2000); // 2000 milliseconds = 2 seconds
  
});

ipcMain.on("download-soh", async () => {
  try {
    mainWindow.webContents.send("📥 Starting SOH 17RA download...");
    console.log("📥 Starting SOH 17RA download..."); // log ke terminal utama
    await copy17Ra(); // jalankan fungsi

    console.log("✅ SOH 17RA download success.");
    mainWindow.webContents.send("log", "✅ SOH 17RA downloaded.");
  } catch (err) {
    console.error("❌ Failed to download SOH 17RA:", err);
    mainWindow.webContents.send("log", "❌ Failed to download SOH 17RA.");
  }
});

ipcMain.on("download-po", async () => {
  try {
    mainWindow.webContents.send("📥 Starting PO download...");
    console.log("📥 Starting PO download..."); // log ke terminal utama
    await copy221(); // jalankan fungsi

    console.log("✅ Outs PO download success.");
    mainWindow.webContents.send("log", "✅ Outs PO downloaded.");
  } catch (err) {
    console.error("❌ Failed to download Outs PO:", err);
    mainWindow.webContents.send("log", "❌ Failed to download Outs PO.");
  }
});

ipcMain.on("checksummary-po", async () => {
  try {
    checkAndNotifyPoFuelSummaryToday();
  } catch (err) {
    console.error("❌ Failed to send test message", err);
    mainWindow.webContents.send("log", "❌ Failed to send test message.");
  }
});

ipcMain.on("send-testmessage", async () => {
  try {
    await sendFilterUsageReminder();
  } catch (err) {
    console.error("❌ Failed to send test message", err);
    mainWindow.webContents.send("log", "❌ Failed to send test message.");
  }
});

// ===== APP EVENTS =====

app.whenReady().then(() => {
  createWindow();
  createTray();
  startBot();
});

app.on("window-all-closed", (e) => {
  e.preventDefault(); // prevent full quit
});


const { app, BrowserWindow, Tray, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let tray = null;
let mainWindow = null;
let botProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    skipTaskbar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.loadFile('renderer.html');

  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });
}

function startBot() {
  if (!botProcess) {
    botProcess = spawn('node', ['dist/index.js'], {
      cwd: __dirname,
      shell: true,
    });

    botProcess.stdout.on('data', (data) => {
      mainWindow.webContents.send('bot-log', data.toString());
    });

    botProcess.stderr.on('data', (data) => {
      mainWindow.webContents.send('bot-log', `[ERROR] ${data.toString()}`);
    });

    botProcess.on('close', (code) => {
      mainWindow.webContents.send('bot-log', `[BOT CLOSED] Code ${code}\n`);
      botProcess = null;
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
  tray = new Tray(path.join(__dirname, 'icon.ico'));
  tray.setToolTip('Ritasi Bot');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Tampilkan Window',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Keluar',
      click: () => {
        stopBot();
        tray.destroy();
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

ipcMain.on('toggle-bot', (event, shouldStart) => {
  shouldStart ? startBot() : stopBot();
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

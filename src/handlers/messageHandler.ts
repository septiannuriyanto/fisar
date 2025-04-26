// src/handlers/messageHandler.ts
import { Worker } from "worker_threads";
import path from "path";
import { formatDateForSupabase } from "../functions";
import { GROUP_LIST, GROUP_WHITELIST } from "../group-whitelist";
import { parseRitasiReport } from "../parsers/groupSupplerParser/groupSupplyParser";
import {
  parseDailyFAOReport,
  parseFilterChangeReport,
} from "../parsers/groupFAOParser/groupFaoParser";
import { parseOilUsageReport } from "../parsers/groupOliParser/groupOliParser";
import { getSockInstance } from "../class/whatsapp-socket";
import { error } from "console";
import { checkUnrecordedSuratJalan } from "../services/ritasi/checkDifferenceRitasi";
import { headerMsg, signatureMsg } from "../class/constants";

export const DEV_MODE: boolean = true; // Set to true for development mode

export async function handleMessage(
  message: string,
  timestamp: number,
  groupId: string | null
) {
  const lines = message.split("\n");
  const header = lines[0];
  //Update logging to reporting group
  const sock = getSockInstance();

  //========================================================================================================Filter group supply dan test, dan judul laporan ritasi
  if (
    (groupId === GROUP_WHITELIST.SUPPLY || groupId === GROUP_WHITELIST.TEST) &&
    header.includes("LAPORAN RITASI FUEL")
  ) {
    //ambil tanggal dari header
    const reportDate = formatDateForSupabase(header);
    if (!reportDate) {
      console.log("⚠️ Gagal ambil tanggal dari judul laporan.");
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: "⚠️ Gagal ambil tanggal dari judul laporan.",
        });
        return;
      }
      return;
    }
    console.log("📨 Pesan ritasi baru dari grup supply");
    const entries = parseRitasiReport(message);
    if (entries.length === 0) {
      console.log("⛔ No valid ritasi data found in message.");
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: `⛔ No valid ritasi data found in message.`,
        });
        return;
      }
      return;
    }

    // 🔁 Jalankan insert di background
    const worker = new Worker(
      path.resolve(__dirname, "../workers/insertRitasiWorker.js"),
      {
        workerData: { entries, reportDate },
      }
    );

    worker.on("message", async (msg) => {
      if (msg.success) {
        console.log("✅ Worker berhasil insert ritasi");
        if (sock) {
          await sock.sendMessage(GROUP_LIST.TEST, {
            text: `✅ Worker berhasil insert ritasi`,
          });
          //Cek ritasi yang belum diinput
          console.log("Surat Jalan yang belum tercatat di ritasi_fuel:");
          const unmatchedDoNumbers = await checkUnrecordedSuratJalan();
          console.table(unmatchedDoNumbers);

          let summaryMessage = ``;
          // Jika ada surat jalan yang belum tercatat, construct message lalu kirim ke group TEST
          if (unmatchedDoNumbers && unmatchedDoNumbers.length > 0) {
            summaryMessage = `${headerMsg}❌ Surat Jalan yang belum tercatat di ritasi_fuel:*\n\n${unmatchedDoNumbers.join(
              "\n"
            )}\n\n*Mohon dilengkapi input ritasinya, Terima kasih.${signatureMsg}`;
            console.log(summaryMessage);
          } else {
            summaryMessage = `${headerMsg}✅ Semua surat jalan sudah tercatat di ritasi_fuel.${signatureMsg}`;
          }

          // Kirim pesan ke grup TEST jika ada surat jalan yang belum tercatat
          if (sock) {
            await sock.sendMessage(GROUP_LIST.FAO, { text: summaryMessage });
          } else {
            console.error("❌ Socket instance not found!");
          }
        }
      } else {
        console.error("❌ Worker gagal insert:", msg.error);
        if (sock) {
          await sock.sendMessage(GROUP_LIST.TEST, {
            text: `❌  Worker gagal insert: ${msg.error}`,
          });
          return;
        }
      }
    });

    worker.on("error", async (err) => {
      console.error("❌ Worker thread error:", err);
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: `❌  Worker thread error: ${err}`,
        });
        return;
      }
    });

    worker.on("exit", async (code) => {
      if (code !== 0) {
        console.error(`⚠️ Worker stopped with exit code ${code}`);
        if (sock) {
          await sock.sendMessage(GROUP_LIST.TEST, {
            text: `⚠️  Worker stopped with exit code ${code}`,
          });
          return;
        }
      }
    });
  }

  //========================================================================================================Filter group fao dan test
  else if (
    (groupId === GROUP_WHITELIST.FAO || groupId === GROUP_WHITELIST.TEST) &&
    header.includes("LAPORAN PENGGANTIAN FILTER")
  ) {
    console.log("📨 Pesan penggantian filter dari grup FAO");

    const entry = parseFilterChangeReport(message);
    if (!entry) {
      console.log("⛔ Gagal parsing laporan filter.");
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: `❌ Gagal parsing laporan filter`,
        });
        return;
      }
      return;
    }

    const worker = new Worker(
      path.resolve(__dirname, "../workers/insertFilterChangeWorker.js"),
      {
        workerData: { entry },
      }
    );

    worker.on("message", async (msg) => {
      if (msg.success) {
        console.log("✅ Worker berhasil insert filter change");
        if (sock) {
          await sock.sendMessage(GROUP_LIST.TEST, {
            text: "Filter change inputted successfuly",
          });
          return;
        }
      } else {
        console.error("❌ Worker gagal insert filter change:", msg.error);
        if (sock) {
          await sock.sendMessage(GROUP_LIST.TEST, {
            text: `❌ Filter change failed : ${msg.error}`,
          });
          return;
        }
      }
    });

    worker.on("error", (err) => {
      console.error("❌ Worker thread error:", err);
    });

    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(`⚠️ Worker stopped with exit code ${code}`);
      }
    });
  }

  //========================================================================================================filter group oli dan test
  else if (
    (groupId === GROUP_WHITELIST.OLI || groupId === GROUP_WHITELIST.TEST) &&
    header.includes("LAPORAN PEMAKAIAN OLI")
  ) {
    const entry = parseOilUsageReport(message);
    if (!entry) {
      console.log("❌ Gagal parsing laporan oli");
      return;
    }

    const worker = new Worker(
      path.resolve(__dirname, "../workers/insertOilUsageWorker.js"),
      {
        workerData: { entry },
      }
    );

    worker.on("message", async (msg) => {
      if (msg.success) {
        console.log("✅ Worker berhasil insert oil usage");
        if (sock) {
          await sock.sendMessage(GROUP_LIST.TEST, {
            text: "✅ Worker berhasil insert oil usage",
          });
          return;
        }
      } else {
        console.error("❌ Worker gagal insert:", msg.error);
        if (sock) {
          await sock.sendMessage(GROUP_LIST.TEST, {
            text: `❌ Worker gagal insert oil usage : ${msg.error}`,
          });
          return;
        }
      }
    });

    worker.on("error", (err) => console.error("❌ Worker error:", err));
    worker.on("exit", (code) => {
      if (code !== 0) console.error(`⚠️ Worker stopped with exit code ${code}`);
    });
  } else if (
    groupId === GROUP_WHITELIST.TEST &&
    header.includes("REPORT DAILY FAO")
  ) {
    const result = await parseDailyFAOReport(message);
    if (!result) {
      console.log("❌ Gagal parsing laporan FAO");
      return;
    }
    console.log(result);
  } else {
    if (DEV_MODE) {
      console.log(`Message From ${groupId}`, message);
    }
  }
}

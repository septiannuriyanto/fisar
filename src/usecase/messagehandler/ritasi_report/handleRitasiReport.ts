// src/usecase/messagehandler/handleRitasiReport.ts
import { Worker } from "worker_threads";
import path from "path";

import { WASocket } from "@whiskeysockets/baileys";
import { extractDatesFromReport } from "../../../jobs/extractDateFromReport";
import { GROUP_LIST } from "../../../group-whitelist";
import { parseWithLLM } from "../../../services/ritasi/parseWithLLM";
import { checkUnrecordedSuratJalan } from "../../../services/ritasi/checkDifferenceRitasi";
import { headerMsg, signatureMsg } from "../../../class/constants";

interface RitasiParams {
  groupId: string;
  message: string;
  sock?: WASocket | null;
  header: string;
}

export async function handleRitasiReport({ groupId, message, sock, header }: RitasiParams) {
  console.log("📨 Pesan ritasi baru dari grup supply");

  const dates = extractDatesFromReport(message);
  const reportDate = dates[0];
  if (!reportDate) {
    console.log("⚠️ Gagal ambil tanggal dari judul laporan.");
    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: "⚠️ Gagal ambil tanggal dari judul laporan.",
      });
    }
    return;
  }

  const payload = await parseWithLLM(message);

  if (!payload) {
    console.log("⛔ Gagal parse ritasi payload.");
    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: "⛔ Gagal parse ritasi payload.",
      });
    }
    return;
  }

  const worker = new Worker(
    path.resolve(__dirname, "../../../workers/insertRitasiWorker.js"),
    {
      workerData: { payload },
    }
  );

  worker.on("message", async (msg) => {
         if (!sock) {
        console.error("❌ WhatsApp socket not available.");
        return;
        }
    if (msg.success) {
      console.log("✅ Worker berhasil insert ritasi");

 
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: `✅ Worker berhasil insert ritasi`,
      });

      const unmatchedDoNumbers = await checkUnrecordedSuratJalan();
      let summaryMessage = unmatchedDoNumbers!.length
        ? `${headerMsg}❌ Surat Jalan yang belum tercatat di ritasi_fuel:\n\n${unmatchedDoNumbers!.join("\n")}\n\n*Mohon dilengkapi input ritasinya, Terima kasih.${signatureMsg}`
        : `${headerMsg}✅ Semua surat jalan sudah tercatat di ritasi_fuel.${signatureMsg}`;

      await sock.sendMessage(GROUP_LIST.TEST, { text: summaryMessage });
    } else {
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: `❌ Worker gagal insert: ${msg.error}`,
      });
    }
  });

  worker.on("error", async (err) => {
         if (!sock) {
        console.error("❌ WhatsApp socket not available.");
        return;
        }
    console.error("❌ Worker thread error:", err);
    await sock.sendMessage(GROUP_LIST.TEST, {
      text: `❌ Worker thread error: ${err.message}`,
    });
  });

  worker.on("exit", async (code) => {
         if (!sock) {
        console.error("❌ WhatsApp socket not available.");
        return;
        }
    if (code !== 0) {
      console.error(`⚠️ Worker stopped with exit code ${code}`);
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: `⚠️ Worker stopped with exit code ${code}`,
      });
    }
  });
}

import { Worker } from "worker_threads";
import path from "path";
import { WASocket } from "@whiskeysockets/baileys";
import { MessageHandlerParams } from "../messageHandlerParams";
import { parseOilUsageReport } from "../../../parsers/groupOliParser/parseOilUsageReport";

export const handleOilUsageReport = async ({
  groupId,
  header,
  message,
  sock,
}: MessageHandlerParams) => {
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
        await sock.sendMessage(groupId, {
          text: "✅ Worker berhasil insert oil usage",
        });
      }
    } else {
      console.error("❌ Worker gagal insert:", msg.error);
      if (sock) {
        await sock.sendMessage(groupId, {
          text: `❌ Worker gagal insert oil usage: ${msg.error}`,
        });
      }
    }
  });

  worker.on("error", (err) => console.error("❌ Worker error:", err));
  worker.on("exit", (code) => {
    if (code !== 0)
      console.error(`⚠️ Worker stopped with exit code ${code}`);
  });
};

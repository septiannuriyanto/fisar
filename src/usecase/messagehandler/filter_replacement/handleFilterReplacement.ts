import { Worker } from "worker_threads";
import path from "path";
import { parseFilterChangeReport } from "../../../parsers/groupFAOParser/parseFilterChangeReport";
import { GROUP_LIST } from "../../../group-whitelist";
import { MessageHandlerParams } from "../messageHandlerParams";

export const handleFilterReplacement = async ({
  groupId,
  header,
  message,
  sock,
}: MessageHandlerParams) => {
  console.log("📨 Pesan penggantian filter dari grup FAO");

  const entry = parseFilterChangeReport(message);
  if (!entry) {
    console.log("⛔ Gagal parsing laporan filter.");
    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: `❌ Gagal parsing laporan filter`,
      });
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
          text: "Filter change inputted successfully",
        });
      }
    } else {
      console.error("❌ Worker gagal insert filter change:", msg.error);
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: `❌ Filter change failed: ${msg.error}`,
        });
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
};

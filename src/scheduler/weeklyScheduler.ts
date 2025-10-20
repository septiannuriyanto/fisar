// src/scheduler/weeklyScheduler.ts
import cron from "node-cron";
import { getSockInstance } from "../class/whatsapp-socket";
import { GROUP_LIST, GROUP_WHITELIST } from "../group-whitelist";
import { sendToTopic } from "../notifications/sendToTopic";
import { handleGenerateWeeklyOdosReport } from "../usecase/cronScheduler/odos/generateWeeklyOdosReport";

export function setupWeeklyJobs() {

  // ============================================================REMINDER PENGAMBILAN SAMPLE FUEL SETIAP SENIN DAN KAMIS JAM 06:00
  cron.schedule("0 6 * * 1,4", async () => {
    console.log("📅 [Weekly] Job running every Monday at 07:00");
    const sock = getSockInstance();
    try {
      const sock = getSockInstance();
      if (!sock) {
        console.error("❌ WhatsApp socket not available.");
        return;
      }

      // Send to Whatsapp group
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: "🔔 Reminder: Pengambilan sample fuel setiap Senin dan Kamis jam 06:00",
      });
      console.log("✅ Weekly reminder sent to WhatsApp group.");
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: "📢 Weekly Monday job done!",
        });
      }

      // 🔔 Kirim push notification ke topic 'filter_alert'
      await sendToTopic(
        "cleanliness_alert",
        "⚠️ Reminder: Fuel Cleanliness Alert",
        `Pengambilan sample fuel setiap Senin dan Kamis jam 06:00`,
        { screen: "/" } // supaya Flutter redirect ke halaman
      );
    } catch (err) {
      console.error("❌ Weekly Monday job error:", err);
    }
  });

  cron.schedule("5 12 * * 0", async () => {
    const sock = getSockInstance();
    console.log("⏰ Menjalankan ODOS Weekly Report otomatis...");
    await handleGenerateWeeklyOdosReport({ message: '', sock, groupId: GROUP_WHITELIST.SM });
  }, {
    timezone: "Asia/Makassar"
  });
  // =============================================================================================================================
}

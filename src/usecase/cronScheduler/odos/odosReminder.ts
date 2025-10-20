import { da } from "date-fns/locale";
import { getSockInstance } from "../../../class/whatsapp-socket";
import { GROUP_LIST, GROUP_WHITELIST } from "../../../group-whitelist";
import { generateChecklist } from "./generateChecklist";
import { generateCompletedOdos } from "./generateCompletedOdos";
import { generateEveningReminder } from "./generateReminderEvening";
import { generateJustInTimeReminder } from "./generateReminderJustInTime";
import { generateMorningReminder } from "./generateReminderMorning";
import { generateNoonReminder } from "./generateReminderNoon";
import { generateYesterdayReminder } from "./generateReminderYesterday";
import { isOdosComplete } from "./isOdosCompleted";


interface odosReminderParams {
  timeOfDay: "morning" | "noon" | "evening" | "justInTime" | "yesterday";
  groupId?: string | null;
}

export async function odosReminder({ timeOfDay, groupId }: odosReminderParams): Promise<void> {
  const sock = getSockInstance();
  console.log(`🛠️ Running ODOS Reminder at ${timeOfDay}`);

  try {
    const allCompleted = await isOdosComplete(); // ✅ Cek dulu apakah semua sudah isi ODOS

    let finalMessage = "";

    if (allCompleted) {
      finalMessage = await generateCompletedOdos(); // ✅ Kirim ucapan selamat
    } else {
      // ❗ Kalau belum lengkap, jalankan sesuai waktu reminder
      let reminderMessage = "";
      let dateChecklist = new Date();

      if (timeOfDay === "morning") {
        reminderMessage = await generateMorningReminder();
      } else if (timeOfDay === "noon") {
        reminderMessage = await generateNoonReminder();
      } else if (timeOfDay === "evening") {
        reminderMessage = await generateEveningReminder();
      } else if (timeOfDay === "yesterday") {
        reminderMessage = await generateYesterdayReminder();
        dateChecklist.setDate(dateChecklist.getDate() - 1); // Ambil tanggal kemarin untuk checklist
      }else {
        reminderMessage = await generateJustInTimeReminder();
      }

      const checklist = await generateChecklist({ date: dateChecklist }); // ✅ Ambil checklist
      finalMessage = `${reminderMessage}\n\n${checklist}`;
    }

    if (sock) {
      await sock.sendMessage(groupId ?? GROUP_WHITELIST.SM, {
        text: finalMessage,
      });
    }
  } catch (err) {
    console.error("❌ Error in ODOS Reminder:", err);
    if (sock) {
      await sock.sendMessage(GROUP_WHITELIST.TEST, {
        text: `❌ Odos Reminder Failed, ${err}`,
      });
    }
  }
}

// src/functions/reminders/generateReminderJustInTime.ts
import { format } from "date-fns";
import { id } from "date-fns/locale";

export async function generateYesterdayReminder(): Promise<string> {
  const now = new Date() // Ambil tanggal kemarin
  now.setDate(now.getDate() - 1);
  const formatted = format(now, "dd MMMM yyyy 'jam' HH:mm", { locale: id });

  return `🔥 *Semangat Tim ODOS!*\n\nBerikut checklist pencapaian ODOS per *${formatted}*:\n`;
}

import { supabase } from "../../../supabaseClient";
import fs from "fs";
import { exportOdosReport, getOdosReportData } from "./generateWeeklyOdosHTML";
import { MessageHandlerParams } from "../../messagehandler/messageHandlerParams";
import { format, getISOWeek } from "date-fns";
import { id } from "date-fns/locale";
import { llmlist } from "../../../models/llm/llmtypes";



export async function getWeeklyOdosReport() {
  const { data, error } = await supabase.rpc('odos_weekly_report');
  if (error) throw new Error(error.message);
  return data;
}

export async function handleGenerateWeeklyOdosReport({ message, sock, groupId }: MessageHandlerParams) {
  if (sock && groupId) {
    await sock.sendMessage(groupId, { text: "🔄 Sedang memproses laporan ODOS mingguan..." });
  }

  // ✅ 1. Ambil data grafik/report
  const reportData = await getOdosReportData();
  const filePath = await exportOdosReport(reportData);
  const img = fs.readFileSync(filePath);

  // ✅ 2. Ambil aggregate weekly & monthly via RPC
  const { data: agg, error } = await supabase.rpc("get_odos_achievement");
  if (error) {
    console.error("RPC get_odos_achievement error:", error);
  }

  const weekly = Number(agg?.[0]?.weekly_percent || 0);
  const monthly = Number(agg?.[0]?.monthly_percent || 0);

  const weeklyFormatted = parseFloat(weekly.toFixed(1));
  const monthlyFormatted = parseFloat(monthly.toFixed(1));

  // ✅ 3. Generate caption pakai LLM dengan nilai % sebagai parameter
  const caption = await generateWeeklyReportCaption(weeklyFormatted, monthlyFormatted);

  // ✅ 4. Kirim ke grup
  if (sock && groupId) {
    await sock.sendMessage(groupId, { image: img, caption });
  }
}



/**
 * Generate caption untuk laporan ODOS mingguan via LLM.
 */

import { startOfMonth, differenceInCalendarDays } from "date-fns";

export function getMonthWeekNum(date: Date): number {
  const monthStart = startOfMonth(date);
  const day = monthStart.getDay(); // Minggu=0, Senin=1

  // Cari Senin pertama di bulan
  const offset = day === 0 ? 1 : (day === 1 ? 0 : 8 - day);
  const firstMonday = new Date(monthStart);
  firstMonday.setDate(monthStart.getDate() + offset);

  // Semua tanggal sebelum Senin pertama → Week 1
  if (date < firstMonday) {
    return 1;
  }

  // Selisih hari dari Senin pertama untuk Week 2+
  const daysDiff = differenceInCalendarDays(date, firstMonday);
  return Math.floor(daysDiff / 7) + 2; // +2 karena Week 2 mulai Senin pertama
}


export async function generateWeeklyReportCaption(
  weeklyAchievement: number,
  monthlyAchievement: number,
  date: Date = new Date()
): Promise<string> {
  const weekNum = getMonthWeekNum(date);  // pakai custom minggu
  const monthName = format(date, "LLLL", { locale: id });
  const year = date.getFullYear();

  try {
    const prompt = `
    Buatkan 1 kalimat caption laporan ODOS untuk Week ${weekNum} Bulan ${monthName} Tahun ${year}.
    Persentase capaian minggu ini: ${weeklyAchievement.toFixed(1)}%
    Persentase capaian bulan berjalan: ${monthlyAchievement.toFixed(1)}%

    - Jika weekly & monthly = 100% → tone perayaan penuh.
    - Jika weekly >= 80% → apresiasi + dorongan ke 100%.
    - Jika < 80% → motivasi & pengingat.
    - Gunakan bahasa Indonesia semi formal dan penuh semangat.
    - Awali dengan emoji 📊.
    `;

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llmlist.QWEN3_235B.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-235b-a22b-07-25:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 80,
        temperature: 0.7
      })
    });

    if (!res.ok) throw new Error("LLM request failed");
    const { choices } = await res.json();
    return choices?.[0]?.message?.content?.trim()
      || getFallbackCaption(weekNum, monthName, year, weeklyAchievement, monthlyAchievement);
  } catch {
    return getFallbackCaption(weekNum, monthName, year, weeklyAchievement, monthlyAchievement);
  }
}

function getFallbackCaption(week: number, month: string, year: number, w: number, m: number): string {
  return `📊 Laporan ODOS Week ${week} Bulan ${month} ${year}: Mingguan ${w.toFixed(1)}% | Bulanan ${m.toFixed(1)}%`;
}



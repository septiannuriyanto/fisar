import { getSockInstance } from "../../class/whatsapp-socket";
import { GROUP_WHITELIST } from "../../group-whitelist";
import { supabase } from "../../supabaseClient";
import { toZonedTime, format } from "date-fns-tz";

// helper untuk format pesan
function buildRefuelingMessage(rows: any[], date: string, shift: number | null) {
  if (rows.length === 0) {
    return `⛽ Tidak ada jadwal refueling untuk tanggal ${date}${shift ? ` shift ${shift}` : ''}.`;
  }

  let message = `⛽ *Jadwal Refueling* ${date}${shift ? ` shift ${shift}` : ''}\n\n`;
  rows.forEach((row, i) => {
    message += `${i + 1}. Unit: *${row.unit_id}* @${row.location || '-'} (${row.user || '-'})\n`;
  });
  return message;
}

export async function refuelingScheduleReminder(options?: {
  date?: Date;        // default: hari ini
  shift?: number;     // default: null (semua shift)
  groupId?: string;   // default: GROUP_WHITELIST.FAO
}) {
  const sock = getSockInstance?.();
  if (!sock) {
    console.error('❌ WhatsApp socket not available for refuelingScheduleReminder.');
    return;
  }

  // konversi tanggal ke zona waktu Asia/Makassar
  const inputDate = options?.date || new Date();
  const timeZone = 'Asia/Makassar';
  const zonedDate = toZonedTime(inputDate, timeZone);
  const dateStr = format(zonedDate, 'yyyy-MM-dd', { timeZone }); // hasil string yyyy-mm-dd

  const shift = options?.shift ?? null;

  // panggil RPC Supabase
  const { data, error } = await supabase
    .rpc('get_refueling_units', {
      p_date: dateStr,                       // sudah yyyy-mm-dd di zona Asia/Makassar
      p_shift: shift ?? null,                // langsung kirim null/number sesuai parameter
    });

  if (error) {
    console.error('❌ Error fetching refueling schedule:', error);
    return;
  }

  const message = buildRefuelingMessage(data || [], dateStr, shift ?? null);

  try {
    await sock.sendMessage(options?.groupId || GROUP_WHITELIST.FAO, { text: message });
    console.log('✅ Refueling schedule reminder terkirim');
  } catch (err) {
    console.error('❌ Error sending refuelingScheduleReminder:', err);
  }
}

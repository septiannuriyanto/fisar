import { dailyCheckFtReminder } from "../../cronScheduler/dailyCheckFt/dailyCheckFtReminder";
import { MessageHandlerParams } from "../messageHandlerParams";

export async function handleFtDailyCheck({
  message,
  sock,
  groupId,
}: MessageHandlerParams) {
    if (sock) {
        await sock.sendMessage(groupId, {
        text: "🔄 Sedang memproses pemeriksaan harian FT...",
        });
    }
    
    // Proses pemeriksaan harian FT di sini
    // Misalnya, ambil data dari database, lakukan validasi, dsb.
    await dailyCheckFtReminder({
  message,
  sock,
  groupId,
});
    
    // Setelah selesai, kirim pesan konfirmasi
    if (sock) {
        await sock.sendMessage(groupId, {
        text: "✅ Pemeriksaan harian FT selesai.",
        });
    }
}
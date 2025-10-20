import { sendMessage } from "../whatsapp";
import { GROUP_LIST } from "../group-whitelist";

export async function sendFilterUsageReminder() {
  const message = `🔔 ***PESAN OTOMATIS***\n\nTesting Bot`;

  try {
    await sendMessage(GROUP_LIST.TEST, message);
    console.log('✅ Pesan reminder berhasil dikirim!');
  } catch (err) {
    if (err instanceof Error) {
      console.error('❌ Gagal kirim pesan reminder:', err.message);
    } else {
      console.error('❌ Gagal kirim pesan reminder:', err);
    }
  }
}

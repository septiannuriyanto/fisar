import { admin } from './firebase';

/**
 * Kirim push notification ke 1 device/token spesifik.
 * @param token FCM device token (dari Flutter app)
 * @param title Judul notifikasi
 * @param body Isi pesan notifikasi
 * @param data Data tambahan (opsional, untuk navigation di app)
 */
export async function sendToToken(
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  const payload = {
    notification: { title, body },
    data,
  };

  try {
    const message = {
      token,
      notification: { title, body },
      data,
    };
    const res = await admin.messaging().send(message);
    console.log(`✅ Sent to device token:`, token, res);
  } catch (error) {
    console.error(`❌ Failed to send to token ${token}:`, error);
  }
}

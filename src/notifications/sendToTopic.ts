// src/notifications/sendToTopic.ts
import { admin } from './firebase';

export async function sendToTopic(topic: string, title: string, body: string, data: Record<string, string> = {}) {
  const payload = {
    notification: { title, body },
    data,
  };

  try {
    const res = await admin.messaging().send({
      topic,
      notification: { title, body },
      data,
    });
    console.log(`✅ Sent to topic "${topic}":`, res);
  } catch (error) {
    console.error(`❌ Failed to send to topic "${topic}":`, error);
  }
}

import { GROUP_WHITELIST } from "../../../group-whitelist";
import { MessageHandlerParams } from "../messageHandlerParams";



export async function handlePlanServiceReminder({ message, sock, groupId }: MessageHandlerParams) {
  // Normalisasi teks jadi array per baris
  const lines = message.split('\n').map(line => line.trim()).filter(Boolean);

  const units: {
    name: string;
    planStart?: string;
    estimation?: string;
  }[] = [];

  let currentUnit: { name: string; planStart?: string; estimation?: string } | null = null;

  for (const line of lines) {
    // Deteksi unit line (FTxxxx atau TFxxxx)
    if (/^(FT|TF)[A-Z0-9]+\s+.*EST\s*\d+\s*HRS/i.test(line)) {
      const match = line.match(/^((FT|TF)[A-Z0-9]+).*?EST\s*(\d+)\s*HRS/i);
      if (match) {
        currentUnit = {
          name: match[1].trim(),
          estimation: `${match[3]} jam`,
        };
        units.push(currentUnit);
      }
    }

    // Cek apakah baris ini menunjukkan plan start untuk unit sebelumnya
    if (currentUnit && /^plan start\s*[:：]?\s*/i.test(line)) {
      const planStartMatch = line.match(/plan start\s*[:：]?\s*(.+)/i);
      if (planStartMatch) {
        currentUnit.planStart = planStartMatch[1].trim();
      }
    }
  }

  if (units.length > 0) {
    const messageText =
      `⚠️ *Terdeteksi unit berawalan FT/TF dalam Plan Service:*\n\n` +
      units
        .map(
          u =>
            `• *${u.name}* — Plan Start: ${u.planStart ?? 'N/A'}, Estimasi: ${u.estimation ?? 'N/A'}`
        )
        .join('\n');

    if (sock && groupId) {
      await sock.sendMessage(GROUP_WHITELIST.TEST, {
        text: messageText,
      });
      await sock.sendMessage(GROUP_WHITELIST.FAO, {
        text: messageText,
      });
    }
  }
}
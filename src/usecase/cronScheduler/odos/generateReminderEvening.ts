import { llmlist } from "../../../models/llm/llmtypes";

export async function generateEveningReminder(): Promise<string> {
  try {
    const body = `Buatkan 1 pesan pengingat singkat dan menginspirasi dalam bahasa Indonesia untuk mengingatkan mengisi ODOS setiap jam 4 sore. Vibes: menjelang pulang kerja, refleksi harian, menunaikan kewajiban ODOS.`;
    
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${llmlist.QWEN3_235B.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3-235b-a22b-07-25:free",
        messages: [{ role: "user", content: body }]
      })
    });

    if (!res.ok) throw new Error("LLM request failed");
    const { choices } = await res.json();
    return choices?.[0]?.message?.content?.trim() || getEveningFallback();
  } catch (err) {
    console.error("LLM fallback triggered:", err);
    return getEveningFallback();
  }
}

function getEveningFallback(): string {
  const fallbacks = [
    "Sebelum pulang, yuk isi ODOS-mu dulu. Bukti aksi nyata kita hari ini! 📝✅",
    "Jangan pulang dulu kalau ODOS belum terisi 😄🚦",
    "Hari hampir usai, yuk tuntaskan dengan mengisi ODOS 💼🌇",
    "Waktunya refleksi! Isi ODOS sebagai bentuk tanggung jawab keselamatan kita 🔐",
    "Menjelang pulang, saatnya isi ODOS-mu. Satu langkah kecil, dampak besar! 👣📋"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

import { llmlist } from "../../../models/llm/llmtypes";

export async function generateMorningReminder(): Promise<string> {
  try {
    const body = `Buatkan 1 pesan pengingat singkat, unik, dan bersemangat dalam bahasa Indonesia untuk mengajak mengisi ODOS (One Day One SAP - Safety Accountability Program) setiap jam 9 pagi. Vibes: mengawali pagi dengan semangat, motivasi kerja, dan semangat keselamatan.`;
    
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
    return choices?.[0]?.message?.content?.trim() || getMorningFallback();
  } catch (err) {
    console.error("LLM fallback triggered:", err);
    return getMorningFallback();
  }
}

function getMorningFallback(): string {
  const fallbacks = [
    "Selamat pagi, pejuang keselamatan! Yuk mulai hari dengan semangat dan isi ODOS-mu sekarang 💪🌞",
    "Pagi penuh semangat! Jangan lupa awali hari dengan kontribusi ODOS kamu 💼✨",
    "Good morning, tim hebat! Yuk, isi ODOS sebelum mulai aktivitas! 🚀",
    "Mentari bersinar, semangat berkobar! Saatnya isi ODOS 💥",
    "Bangun dan bersinar! ODOS-mu menanti, jangan sampai kelewat ya ☕✅"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

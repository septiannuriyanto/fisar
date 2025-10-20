import { llmlist } from "../../../models/llm/llmtypes";

export async function generateNoonReminder(): Promise<string> {
  try {
    const body = `Buatkan 1 pesan pengingat singkat dan enerjik dalam bahasa Indonesia untuk mengingatkan mengisi ODOS setiap jam 2 siang. Vibes: habis istirahat, energi sudah terisi, semangat siang hari.`;
    
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
    return choices?.[0]?.message?.content?.trim() || getNoonFallback();
  } catch (err) {
    console.error("LLM fallback triggered:", err);
    return getNoonFallback();
  }
}

function getNoonFallback(): string {
  const fallbacks = [
    "Energi sudah penuh, saatnya tunjukkan aksi keselamatanmu di ODOS! 🚧🔥",
    "Siang bukan alasan untuk lupa ODOS! Yuk, isi sekarang juga! 😎✅",
    "Istirahat sudah, sekarang waktunya kontribusi ODOS 💪",
    "Siang cerah, semangat membara! Isi ODOS-mu dan jadilah inspirasi 💡",
    "Sambil ngopi siang, jangan lupa isi ODOS ya! ☕✍️"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

import { llmlist } from "../../../models/llm/llmtypes";
import { getRandomFallback } from "./getRandomFallback";

export async function generateThankYouMessage(nickname: string): Promise<string> {
  try {
    const body = `Buatkan 1 ucapan terima kasih yang singkat, unik dan bersemangat dalam bahasa Indonesia kepada ${nickname} atas kontribusinya dalam program ODOS (One Day One SAP - Safety Accountability Program).`;
        

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${llmlist.QWEN3_235B.apiKey}`,
    "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
    "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    "model": "qwen/qwen3-235b-a22b-07-25:free",
    "messages": [
      {
        "role": "user",
        "content": `${body}`
      }
    ]
  })
});

    const { choices } = await res.json();
    const reply = choices?.[0]?.message?.content?.trim();
    return reply || getRandomFallback(nickname);
  } catch (err) {
    console.error('LLM fallback triggered:', err);
    return getRandomFallback(nickname);
  }
}


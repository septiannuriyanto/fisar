import { llmlist } from "../../models/llm/llmtypes";
import { ReconcilePayload, RitasiEntry } from "../../parsers/groupSupplerParser/parseRitasiReportNew";
import { retryAsync } from "../retryAsync";

// === PROMPT CREATOR ===
function createPrompt(message: string): string {
  return `
Tugasmu hanya mengubah laporan WhatsApp di bawah ini menjadi JSON array PERSIS sesuai format.

ATURAN WAJIB:

- Output hanya boleh JSON array, TANPA TEKS TAMBAHAN.
- Output HARUS diawali "[" dan diakhiri "]".
- Jangan beri penjelasan, pembuka, atau penutup.
- Kalau ada field yang tidak jelas, isi dengan null.

=== Contoh Input ===

FT249 9500 Lt
FT251 8000 Lt
SHIFT 2

=== Contoh Output yang BENAR ===

[
  { "unit_id": "FT249", "qty": 9500, "do_number": "01" },
  { "unit_id": "FT251", "qty": 8000, "do_number": "02" }
]

=== Input Laporan Yang Harus Kamu Proses ===

${message}

${message}
`;
}

// === FUNGSI FETCH KE OPENROUTER LLM ===
async function askLLM(message: string): Promise<RitasiEntry[]> {
  const body = {
    model: llmlist.MISTRAL_SMALL_24B.model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant that converts messy WhatsApp fuel reports into JSON array.' },
      { role: 'user', content: createPrompt(message) }
    ]
  };

  const res = await fetch(llmlist.MISTRAL_SMALL_24B.apiKey, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${llmlist.MISTRAL_SMALL_24B.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://your-project.com',
      'X-Title': 'Ritasi Parser'
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  const aiText = json.choices?.[0]?.message?.content || '';

  try {
    const parsed: RitasiEntry[] = JSON.parse(aiText);
    if (!Array.isArray(parsed)) throw new Error('AI response bukan array');
    return parsed;
  } catch {
    console.warn('⚠️ Failed parsing LLM JSON. Returning empty array.');
    return [];
  }
}

// === FALLBACK PARSER ===
function fallbackParse(message: string): RitasiEntry[] {
  const lines = message.split('\n');
  const result: RitasiEntry[] = [];

  let index = 1;
  let currentShift = 1;
  const shiftMatch = message.match(/shift\s*(\d)/i);
  if (shiftMatch) currentShift = parseInt(shiftMatch[1]);

  const dateMatch = message.match(/TANGGAL\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})/i);
  const [day, month, yearRaw] = dateMatch ? [dateMatch[1], dateMatch[2], dateMatch[3]] : ['01', '01', '2025'];
  const year = yearRaw.length === 4 ? yearRaw : `20${yearRaw.padStart(2, '0')}`;
  const formattedDateShort = `${year.slice(2)}${month.padStart(2, '0')}${day.padStart(2, '0')}`;

  for (const line of lines) {
    const match = line.match(/FT\s?(\d+)\s*[-:\s]*\s*(\d[\d.,]*)/i);
    if (match) {
      const unit_id = `FT${match[1]}`;
      const qty = parseInt(match[2].replace(/[.,]/g, ''), 10);
      const urutan = String(index).padStart(2, '0');
      const do_number = `G${formattedDateShort}${currentShift}${urutan}`;

      result.push({ unit_id, qty, do_number });
      index++;
    }
  }

  return result;
}

// === FINAL FUNCTION: PARSE TO RECONCILE PAYLOAD ===
export async function parseWithLLM(message: string): Promise<ReconcilePayload | null> {
  const shiftMatch = message.match(/shift\s*(\d)/i);
  const shift = shiftMatch ? parseInt(shiftMatch[1]) : 1;

  const dateMatch = message.match(/TANGGAL\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})/i);
  if (!dateMatch) {
    console.warn('⚠️ Tanggal tidak ditemukan dalam pesan!');
    return null;
  }

  const [_, day, month, yearRaw] = dateMatch;
  const year = yearRaw.length === 4 ? yearRaw : `20${yearRaw.padStart(2, '0')}`;
  const report_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

  let items: RitasiEntry[] = [];

  try {
    console.log('🔍 Asking LLM...');
    items = await askLLM(message);
  } catch {
    console.warn('⚠️ LLM gagal. Fallback ke parser lokal...');
    items = fallbackParse(message);
  }

  if (items.length === 0) {
    console.warn('⚠️ Tidak ada data ritasi ditemukan!');
    return null;
  }

  const total_in = items.reduce((sum, item) => sum + item.qty, 0);

  return {
    report_date,
    shift,
    total_in,
    jumlah_ritasi: items.length,
    items,
  };
}

// src/parser.ts

export interface RitasiEntry {
  unit: string;
  volume: number;
  noDo: string;
  shift: number;
}

export function parseRitasiReport(message: string): RitasiEntry[] {
  // Ubah seluruh message ke lowercase untuk validasi judul
  const lowerMessage = message.toLowerCase();

  // Cek apakah ada judul yang sesuai
  const titleMatch = lowerMessage.includes('laporan ritasi fuel');
  if (!titleMatch) {
    console.warn('⚠️ Judul laporan tidak sesuai atau tidak ditemukan!');
    return [];
  }

  // Ambil tanggal
  const dateMatch = message.match(/TANGGAL\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i);
  const shiftMatch = message.match(/SHIFT\s+(\d)/i);

  if (!dateMatch) {
    console.warn('⚠️ Format tanggal tidak ditemukan!');
    return [];
  }

  const [_, day, month, yearRaw] = dateMatch;
  const year = yearRaw.length === 4 ? yearRaw.slice(2) : yearRaw;
  const formattedDate = `${year.padStart(2, '0')}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
  const shift = shiftMatch ? parseInt(shiftMatch[1]) : 1;

  const lines = message.split('\n');
  const data: RitasiEntry[] = [];

  let index = 1;

  for (const line of lines) {
    const match = line.match(/^\s*(\d+)\./);
    if (match) {
      const urutan = String(index).padStart(2, '0');
      const noDo = `G${formattedDate}${shift}${urutan}`;

      data.push({
        unit: '',
        volume: 0,
        noDo,
        shift,
      });

      index++;
    }
  }

  return data;
}

  
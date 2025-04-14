// src/parser.ts

export interface RitasiEntry {
  unit: string;
  volume: number;
  noDo: string;
}

export function parseRitasiReport(message: string): RitasiEntry[] {
  // Ambil tanggal dari baris laporan
  const dateMatch = message.match(/LAPORAN RITASI FUEL TANGGAL\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i);
  if (!dateMatch) {
    console.warn('⚠️ Format tanggal tidak ditemukan!');
    return [];
  }

  // Ekstrak dan format tanggal jadi YYMMDD
  const [_, day, month, yearRaw] = dateMatch;
  const year = yearRaw.length === 4 ? yearRaw.slice(2) : yearRaw; // 2 digit tahun
  const formattedDate = `${year.padStart(2, '0')}${month.padStart(2, '0')}${day.padStart(2, '0')}`;

  const lines = message.split('\n');
  const data: RitasiEntry[] = [];

  let index = 1;

  for (const line of lines) {
    const match = line.match(/FT\s*?(\d+)\s*[-–]\s*([\d.,]+)/i);
    if (match) {
      const unit = `FT${match[1]}`;
      const rawVolume = match[2].replace(/\./g, '').replace(',', '.');
      const volume = parseFloat(rawVolume);
      const urutan = String(index).padStart(2, '0'); // 👉 selalu 2 digit
      const noDo = `G${formattedDate}1${urutan}`;

      if (!isNaN(volume)) {
        data.push({ unit, volume, noDo });
        index++;
      }
    }
  }

  return data;
}

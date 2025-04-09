// src/parser.ts

export interface RitasiEntry {
    unit: string;
    volume: number;
  }
  
  export function parseRitasiReport(message: string): RitasiEntry[] {
    // Cek apakah pesan mengandung pattern FT123 - volume
    if (!/FT\s*\d+\s*[-–]\s*[\d.,]+/i.test(message)) {
      return []; // Bukan pesan ritasi, langsung skip
    }
  
    const lines = message.split('\n');
    const data: RitasiEntry[] = [];
  
    for (const line of lines) {
      const match = line.match(/FT\s*?(\d+)\s*[-–]\s*([\d.,]+)/i);
      if (match) {
        const unit = `FT${match[1]}`;
        const rawVolume = match[2].replace(/\./g, '').replace(',', '.');
        const volume = parseFloat(rawVolume);
  
        if (!isNaN(volume)) {
          data.push({ unit, volume });
        }
      }
    }
  
    return data;
  }
  
  
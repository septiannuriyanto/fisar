export interface RitasiEntry {
  unit_id: string;
  qty: number;
  do_number: string;
}

export interface ReconcilePayload {
  report_date: string;
  shift: number;
  total_in: number;
  jumlah_ritasi: number;
  items: RitasiEntry[];
}

export function parseRitasiReportNew(message: string): ReconcilePayload | null {
  const lowerMessage = message.toLowerCase();

  if (!lowerMessage.includes('laporan ritasi fuel')) {
    console.warn('⚠️ Judul laporan tidak sesuai atau tidak ditemukan!');
    return null;
  }

  const dateMatch = message.match(/TANGGAL\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/i);
  const shiftMatch = message.match(/SHIFT\s+(\d)/i);

  if (!dateMatch) {
    console.warn('⚠️ Format tanggal tidak ditemukan!');
    return null;
  }

  const [_, day, month, yearRaw] = dateMatch;
  const year = yearRaw.length === 4 ? yearRaw : `20${yearRaw.padStart(2, '0')}`;
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const shift = shiftMatch ? parseInt(shiftMatch[1]) : 1;

  const lines = message.split('\n');
  const items: RitasiEntry[] = [];

  let index = 1;
  let totalIn = 0;

  for (const line of lines) {
    const match = line.match(/^\s*\d+\.\s*(\w+)\s+(\d+)\s*/);
    if (match) {
      const unit_id = match[1];
      const qty = parseInt(match[2]);

      const urutan = String(index).padStart(2, '0');
      const do_number = `G${year.slice(2)}${month.padStart(2, '0')}${day.padStart(2, '0')}${shift}${urutan}`;

      items.push({ unit_id, qty, do_number });

      totalIn += qty;
      index++;
    }
  }

  if (items.length === 0) {
    console.warn('⚠️ Tidak ada item data ditemukan!');
    return null;
  }

  return {
    report_date: formattedDate,
    shift,
    total_in: totalIn,
    jumlah_ritasi: items.length,
    items,
  };
}

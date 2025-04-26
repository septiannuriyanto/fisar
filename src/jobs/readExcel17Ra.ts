import { formatTanggalHariIni } from "../functions";
import { DataSOH, whitelist } from "../types/datasoh";
import * as XLSX from 'xlsx';

export const readExcelAndFilter17RA = (path: string) => {
  const workbook = XLSX.readFile(path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
  const rows = data.slice(1);

  const today = new Date();
  const yyMMdd = today.toISOString().slice(2, 10).replace(/-/g, ''); // "240416"

  // Ambil index kolom C, E, L (C=2, E=4, L=11 dalam array indeks 0-based)
  const result: DataSOH[] = rows.map(row => {
    const wh_code = (row[2] || '').toString().trim().toUpperCase();
    const stock_code = Number(row[4]) || 0;
    const qty = Number(row[11]) || 0;
    const tgl = formatTanggalHariIni();

    const id = `${yyMMdd}${wh_code}${stock_code}`;

    return {
      id,
      wh_code,
      stock_code,
      tgl,
      qty,
      source: 1, // 1 = dari sistem, 0 dari aktual
      report_by: 'FISAR'
    };
  });

  // Filter pakai whitelist
  const filtered = result.filter(d => whitelist.includes(d.stock_code));

  console.log('✅ Filtered Result:', filtered);
  return filtered;
};

  
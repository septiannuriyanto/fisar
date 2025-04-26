import { formatDateForSupabase } from "../../functions";

export interface OilUsageEntry {
  id: string; // yymmdd-unit_id-oil_type
  tanggal: string;
  storage: string;
  unit_id: string;
  hm: number;
  shift: number;
  jam: string;
  oil_type: string;
  qty: number;
}

export function parseOilUsageReport(message: string): OilUsageEntry[] {
  const lines = message.split('\n').map(line => line.trim()).filter(Boolean);

  const getValue = (label: string) => {
    const line = lines.find(l => l.toUpperCase().startsWith(label.toUpperCase()));
    return line?.split(':')[1]?.trim() || '';
  };

  const tanggalRaw = getValue('TANGGAL');
  const tanggalParts = tanggalRaw.split('/');
  const tanggal = formatDateForSupabase(tanggalRaw)!;

  const storage = getValue('STORAGE');
  const unit_id = getValue('UNIT').replace(/\s/g, '');
  const hm = parseInt(getValue('HM'), 10);
  const shift = parseInt(getValue('SHIFT'), 10);
  const jam = getValue('JAM');

  const itemStart = lines.findIndex(l => l.toUpperCase().includes('PEMAKAIAN OLI'));
  const itemLines = lines.slice(itemStart + 1);

  const entries: OilUsageEntry[] = [];
  
  // Daftar jenis oli yang valid
  const validOilTypes = [
    'SAE10', 'SAE15W-40', 'SAE30', 'SAE50', 'XT46', 'TRANSLIK HD10', 
    'TRANSLIK HD30', 'SPIRAX 85W-140', 'CORENA', 'ALVANIA (S2)', 'ALBIDA (S3)'
  ];

  for (const line of itemLines) {
    const [oil_type, value] = line.split(':').map(s => s.trim());
    if (!value || !validOilTypes.includes(oil_type)) continue; // Hanya proses jenis oli yang valid
  
    const match = value.match(/\d+(\.\d+)?/); // Cari angka pertama
    const qty = match ? parseFloat(match[0]) : NaN;
  
    if (oil_type && !isNaN(qty)) {
      const yymmdd = tanggal!.replace(/-/g, '');
      
      // Menghilangkan spasi dan mengubah ke huruf kapital untuk storage dan unit_id
      const cleanedStorage = storage.replace(/\s/g, '').toUpperCase();
      const cleanedUnitId = unit_id.replace(/\s/g, '').toUpperCase();
  
      entries.push({
        id: `${yymmdd}-${cleanedUnitId}-${oil_type}`,
        tanggal,
        storage: cleanedStorage,
        unit_id: cleanedUnitId,
        hm,
        shift,
        jam,
        oil_type,
        qty,
      });
    }
  }
  

  return entries;
}


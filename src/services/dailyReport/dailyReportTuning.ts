import { FuelmanDailyReport } from "../../types/fuelmanReport";
import { getTeraCache } from "../../utils/teraCache";
import { issuingArrayToRecord } from "./convertIssuingToRecord";

export function tuningRawDailyReport(report : FuelmanDailyReport) : FuelmanDailyReport{

    let tunedReport = { ...report };

    const issuingOutRecord = issuingArrayToRecord(tunedReport.issuing_out);
    // ✅ Tuning 1: Sonding akhir auto isi kalau issuing 0
    tunedReport.sonding = tuneSondingFromIssuing(tunedReport.sonding, issuingOutRecord);

    // ✅ Tuning 2: Hitung liter dari cm
    tunedReport.sonding = addSondingLiter(tunedReport.sonding);

    return tunedReport;
}


//TUNING 1 : IF SONDING AKHIR NULL, CEK USAGE. IF USAGE  = 0, SONDING AKHIR = SONDING AWAL
function tuneSondingFromIssuing(
  sonding: { unit_id: string; awal: number; akhir: number | null }[],
  issuing_out: Record<string, number>
): { unit_id: string; awal: number; akhir: number | null }[] {
  return sonding.map(entry => {
    const issuingQty = issuing_out[entry.unit_id] ?? 0;

    if (entry.akhir === null && issuingQty === 0) {
      return {
        ...entry,
        akhir: entry.awal
      };
    }

    return entry;
  });
}


// ===================================================================================
// ✅ Tuning 2: Konversi cm ke liter dari teraCache
function addSondingLiter(
  sonding: { unit_id: string; awal: number; akhir: number | null }[]
): { unit_id: string; awal: number; akhir: number | null; awal_liter: number | null; akhir_liter: number | null }[] {
  const teraCache = getTeraCache();

  const interpolate = (unitId: string, height: number): number | null => {
    const rows = teraCache.filter(r => r.unit_id === unitId && r.height_cm !== null && r.qty_liter !== null);
    rows.sort((a, b) => (a.height_cm! - b.height_cm!));

    if (rows.length === 0) return null;

    for (let i = 0; i < rows.length - 1; i++) {
      const low = rows[i];
      const high = rows[i + 1];

      if (height >= low.height_cm! && height <= high.height_cm!) {
        const slope = (high.qty_liter! - low.qty_liter!) / (high.height_cm! - low.height_cm!);
        return low.qty_liter! + slope * (height - low.height_cm!);
      }
    }

    if (height <= rows[0].height_cm!) return rows[0].qty_liter!;
    if (height >= rows[rows.length - 1].height_cm!) return rows[rows.length - 1].qty_liter!;

    return null;
  };

  return sonding.map(entry => ({
    ...entry,
    awal_liter: entry.awal !== null ? interpolate(entry.unit_id, entry.awal) : null,
    akhir_liter: entry.akhir !== null ? interpolate(entry.unit_id, entry.akhir) : null,
  }));
}
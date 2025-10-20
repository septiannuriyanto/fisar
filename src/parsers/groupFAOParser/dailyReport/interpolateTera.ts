import { getTeraCache } from "../../../utils/teraCache";


function interpolate(unit_id: string, height: number): number | null {
  const rows = getTeraCache().filter(r => r.unit_id === unit_id && r.height_cm !== null && r.qty_liter !== null);
  rows.sort((a, b) => (a.height_cm! - b.height_cm!));  // Urut naik berdasarkan height_cm

  if (rows.length === 0) return null;

  for (let i = 0; i < rows.length - 1; i++) {
    const low = rows[i];
    const high = rows[i + 1];

    if (height >= low.height_cm! && height <= high.height_cm!) {
      const slope = (high.qty_liter! - low.qty_liter!) / (high.height_cm! - low.height_cm!);
      return low.qty_liter! + slope * (height - low.height_cm!);
    }
  }

  // Kalau lebih kecil dari minimum atau lebih besar dari maksimum
  if (height <= rows[0].height_cm!) return rows[0].qty_liter!;
  if (height >= rows[rows.length - 1].height_cm!) return rows[rows.length - 1].qty_liter!;

  return null;
}

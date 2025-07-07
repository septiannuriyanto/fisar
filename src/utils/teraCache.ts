// src/utils/loadTeraCache.ts
import fs from 'fs';
import csv from 'csv-parser';

export interface TeraRow {
  unit_id: string;
  height_cm: number | null;
  qty_liter: number | null;
}

let teraCache: TeraRow[] = [];

export function getTeraCache(): TeraRow[] {
  return teraCache;
}

export function loadTeraCacheFromCSV(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const results: TeraRow[] = [];

    fs.createReadStream(path)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          unit_id: row.unit_id,
          height_cm: parseFloat(row.height_cm) || null,
          qty_liter: parseFloat(row.qty_liter) || null,
        });
      })
      .on('end', () => {
        teraCache = results;
        console.log(`✅ Loaded ${teraCache.length} rows from CSV`);
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ Failed loading CSV:', err);
        reject(err);
      });
  });
}

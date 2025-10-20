import { formatTodaySupabase } from "../functions";
import { DataSOH } from "../types/datasoh";
import { supabase } from "../supabaseClient";
import * as XLSX from 'xlsx';

// Ambil daftar material_code dari Supabase
async function fetchAllowedMaterialCodes(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("materials")
    .select("material_code");

  if (error) {
    console.error("❌ Failed to fetch material codes from Supabase:", error.message);
    return new Set();
  }

  return new Set(data.map((m) => m.material_code));
}

// export const readExcelAndFilter17RA = async (path: string): Promise<DataSOH[]> => {
//   console.log(`📖 Reading and filtering Excel file: ${path}`);
//   const allowedCodes = await fetchAllowedMaterialCodes();
//   if (allowedCodes.size === 0) {
//     console.warn("⚠️ No allowed material codes loaded. Returning empty result.");
//     return [];
//   }

//   console.log(`✅ Allowed material codes loaded: ${allowedCodes.size} items`);

//   console.log(`📊 Reading Excel file from path: ${path}`);
  
//   const workbook = XLSX.readFile(path);
//   const sheet = workbook.Sheets[workbook.SheetNames[0]];
//   const data = XLSX.utils.sheet_to_json(sheet) as any[];

//   console.log(`📊 Read ${data.length} rows from Excel file.`);
  

//   const date_snapshot = formatTodaySupabase();

//   const result: DataSOH[] = data
//     .filter((row) => {
//       const materialCode = String(row["Material Number"] || "").trim();
//       const rawNumber = String(row["Number"] || "").trim();
//       const number = Number(rawNumber);

//       // ❌ Skip jika materialCode = 1000064853 dan Number > 70000
//       if (materialCode === "1000064853" && number > 70000) {
//         return false;
//       }
//       return true;
//     })
//     .map((row) => {
//       const storage_location = (row["Storage Location"] || '').toString().trim().toUpperCase();
//       const material_code = String(row["Material Number"]).trim();
//       const soh = Number(row["Avaible Stock"]) || 0;

//       return {
//         storage_location,
//         material_code,
//         date_snapshot,
//         soh,
//         source: 1,
//         report_by: "FISAR",
//       };
//     })
//     .filter((d) => allowedCodes.has(d.material_code));

//   console.log("✅ Filtered Result:", result);
//   return result;
// };



export const readExcelAndFilter17RA = async (path: string): Promise<DataSOH[]> => {
  console.log(`📖 Reading and filtering Excel file: ${path}`);

  const allowedCodes = await fetchAllowedMaterialCodes();
  if (allowedCodes.size === 0) {
    console.warn("⚠️ No allowed material codes loaded. Returning empty result.");
    return [];
  }
  console.log(`✅ Allowed material codes loaded: ${allowedCodes.size} items`);

  console.log(`📊 Reading Excel file from path: ${path}`);
  const workbook = XLSX.readFile(path, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  console.log(XLSX.utils.decode_range(sheet['!ref'] || ''));

  const rawData = XLSX.utils.sheet_to_json(sheet, {
    raw: true,
    defval: '',
  }) as Record<string, any>[];

  console.log(`📊 Raw rows parsed: ${rawData.length}`);

  const date_snapshot = formatTodaySupabase();

  const result: DataSOH[] = [];
  for (const row of rawData) {
    const materialCode = String(row['Material Number'] || '').trim();
    const number = Number(row['Number'] || '0');

    // ❌ Skip jika materialCode = 1000064853 dan Number > 70000
    if (materialCode === '1000064853' && number > 70000) continue;

    // ❌ Skip jika materialCode tidak masuk daftar
    if (!allowedCodes.has(materialCode)) continue;

    const storage_location = String(row['Storage Location'] || '').trim().toUpperCase();
    const soh = Number(row['Avaible Stock']) || 0;

    result.push({
      storage_location,
      material_code: materialCode,
      date_snapshot,
      soh,
      source: 1,
      report_by: 'FISAR',
    });
  }

  console.log(`✅ Filtered Result: ${result.length} rows`);
  return result;
};

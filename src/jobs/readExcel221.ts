import * as XLSX from 'xlsx';

export interface Excel221Data {
  po_number: string;
  po_qty: number;
  remaining_qty: number;
  days_to_duedate: number;
  narrative: string;
}

export const readExcelAndFilter221 = (path: string): Excel221Data[] => {
  const stock_code_fuel = 5517;

  const workbook = XLSX.readFile(path);
  const sheetName = 'PO'; // Ganti sesuai nama sheet kalau berbeda
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  const result: Excel221Data[] = [];

  jsonData.forEach((row: any) => {
    if (row['Stock Code/PR No.'] === stock_code_fuel) {
      result.push({
        po_number: row[' PO No.']?.toString() ?? '',
        po_qty: Number(row['Part No.']) || 0,
        remaining_qty: Number(row['Qty To Come']) || 0,
        days_to_duedate: Number(row['LT Due date']) || 0,
        narrative: row['Narrative']?.toString() ?? '',
      });
    }
  });

  if (result.length === 0) {
    console.log('⛔ No valid data found in the Excel file.');
    throw Error('No valid data found in the Excel file.');
  }

  return result;
};

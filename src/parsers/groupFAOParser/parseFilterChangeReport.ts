export interface FilterChangeEntry {
    tanggal: string; // YYYY-MM-DD
    unit_id: string;
    flowmeter: number;
    qty: number;
    fuelman: string;
    operator: string;
  }
  
  export function parseFilterChangeReport(message: string): FilterChangeEntry | null {
    const tanggalMatch = message.match(/Tanggal\s*:\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const unitMatch = message.match(/Unit\s*:\s*(\w+)/);
    const flowmeterMatch = message.match(/Flowmeter\s*:\s*(\d+)/);
    const jumlahMatch = message.match(/Jumlah\s*:\s*(\d+)/);
    const fuelmanMatch = message.match(/Fuelman\s*:\s*(.+)/);
    const operatorMatch = message.match(/Operator\s*:\s*(.+)/);
  
    if (!tanggalMatch || !unitMatch || !flowmeterMatch || !jumlahMatch || !fuelmanMatch || !operatorMatch) {
      return null;
    }
  
    const [_, day, month, year] = tanggalMatch;
    const tanggal = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
    return {
      tanggal,
      unit_id: unitMatch[1],
      flowmeter: parseInt(flowmeterMatch[1]),
      qty: parseInt(jumlahMatch[1]),
      fuelman: fuelmanMatch[1].trim(),
      operator: operatorMatch[1].trim()
    };
  }
  
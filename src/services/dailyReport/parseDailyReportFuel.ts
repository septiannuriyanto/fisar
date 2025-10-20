import { FuelmanReport } from "../../types/fuelmanReport";

function parseSmartNumber(input: string, options?: { treatAsThousands?: boolean; outputWithComma?: boolean }): number | string {
  const clean = input.trim();

  if (!clean) return options?.outputWithComma ? '' : NaN;

  let value = clean;

  // Untuk output string dengan koma (flowmeter & sonding)
  if (options?.outputWithComma) {
    return value.replace(/\./g, ',');
  }

  // Smart parsing angka campuran koma/titik
  if (clean.includes('.') && clean.includes(',')) {
    value = clean.replace(/\./g, '').replace(',', '.');
  } else if (clean.includes(',') && !clean.includes('.')) {
    value = clean.replace(',', '.');
  } else if (clean.includes('.') && !clean.includes(',')) {
    const parts = clean.split('.');
    if (parts.length > 1 && parts[1].length === 3) {
      value = clean.replace(/\./g, '');
    }
  }

  let result = parseFloat(value);

  if (options?.treatAsThousands) {
    result = Math.round(result);
  }

  return result;
}

export function parseFuelmanReport(text: string): FuelmanReport {
  const getSection = (title: string): string[] => {
  const regex = new RegExp(`\\*${title}\\*\\n([\\s\\S]*?)(?=\\n\\*(?!TOTAL)|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim().split('\n').filter(Boolean) : [];
};


  const parseKeyValueNumber = (lines: string[], treatAsThousands = false): Record<string, number> => {
    const result: Record<string, number> = {};
    lines.forEach(line => {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value !== undefined) {
        const num = parseSmartNumber(value, { treatAsThousands });
        if (!isNaN(num as number)) result[key] = num as number;
      }
    });
    return result;
  };

  const parseRangeSection = (lines: string[]): Record<string, { awal: number; akhir: number | null }> => {
    const result: Record<string, { awal: number; akhir: number | null }> = {};
    lines.forEach(line => {
      const [key, value] = line.split('=').map(s => s.trim());
      if (key && value !== undefined) {
        if (value.includes('-')) {
          const [awalStr, akhirStr] = value.split('-').map(s => s.trim());
          result[key] = {
            awal: parseSmartNumber(awalStr) as number,
            akhir: akhirStr ? (parseSmartNumber(akhirStr) as number) : null
          };
        } else {
          result[key] = {
            awal: parseSmartNumber(value) as number,
            akhir: null
          };
        }
      }
    });
    return result;
  };

const parseTotal = (sectionTitle: string, treatAsThousands = false): number | null => {
  const section = getSection(sectionTitle);

  for (const line of section) {
    if (/total/i.test(line)) {
      const numMatch = line.match(/([\d.,]+)/);
      if (numMatch) {
        return parseSmartNumber(numMatch[1], { treatAsThousands }) as number;
      }
    }
  }

  return null;
};




  const dateMatch = text.match(/TGL\s*:\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{2,4})/i);

  const tanggal = dateMatch
    ? `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`
    : '';

  const shiftMatch = text.match(/SHIFT\s*(\d+)/i);
  const shift = shiftMatch ? parseInt(shiftMatch[1], 10) : 0;

  const issuingOut = parseKeyValueNumber(getSection('ISSUING OUT \\(LITER\\)'), true);
  const ritasi = parseKeyValueNumber(getSection('RITASI \\(LITER\\)'), true);

  const readiness: Record<string, string> = {};
  getSection('READINESS FT').forEach(line => {
    const [key, value] = line.split('=').map(s => s.trim());
    if (key && value !== undefined) readiness[key] = value;
  });

  const sonding = parseRangeSection(getSection('SONDING AWAL - AKHIR \\(CM\\)'));
  const flowmeter = parseRangeSection(getSection('FLOWMETER AWAL - AKHIR'));

  const noteMatch = text.match(/\*Note\*[\s\S]*$/i);
  const note = noteMatch ? noteMatch[0].replace(/\*Note\*\s*/i, '').trim() : '';

return {
  tanggal,
  shift,
  issuing_out: issuingOut,
  total_out: parseTotal('ISSUING OUT \\(LITER\\)', true),
  ritasi,
  total_in: parseTotal('RITASI \\(LITER\\)', true),
  readiness,
  sonding,
  flowmeter,
  note
};

}

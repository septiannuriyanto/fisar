export interface DailyFAOUnitReport {
    unit_id: string;
    unit_type: 'MTG' | 'FT';
    qty_out: number;
    qty_in: number;
    sonding_awal: number | null;
    sonding_akhir: number | null;
    flowmeter_awal: number | null;
    flowmeter_akhir: number | null;
    readiness_status: boolean | null;
    readiness_location: string | null;
    remark?: string;
  }
  
  export interface DailyFAOParseResult {
    tanggal: string; // YYYY-MM-DD
    shift: number;
    reported_by?: string;
    remark?: string;
    units: DailyFAOUnitReport[];
  }
  
  export function parseDailyFAOReport(message: string): DailyFAOParseResult {
    const lines = message.split('\n').map(line => line.trim());
    const units: Record<string, Partial<DailyFAOUnitReport>> = {};
  
    let tanggal = '';
    let shift = 0;
  
    for (const line of lines) {
      // Tanggal
      const tglMatch = line.match(/^TANGGAL\s*=\s*(\d{2})\/(\d{2})\/(\d{4})$/i);
      if (tglMatch) {
        tanggal = `${tglMatch[3]}-${tglMatch[2]}-${tglMatch[1]}`;
        continue;
      }
  
      // Shift
      const shiftMatch = line.match(/^SHIFT\s*=\s*(\d+)/i);
      if (shiftMatch) {
        shift = parseInt(shiftMatch[1]);
        continue;
      }
  
      // ISSUING OUT
      const outMatch = line.match(/^(FT|MTG)\s?(\d+)\s*=\s*([\d.,]+)?$/i);
      if (outMatch) {
        const [_, prefix, num, val] = outMatch;
        const key = prefix + num;
        units[key] = units[key] || { unit_id: key, unit_type: prefix as 'FT' | 'MTG' };
        if (val) units[key].qty_out = parseFloat(val.replace(',', '.'));
        else units[key].qty_out = 0;
        continue;
      }
  
      // READINESS FT
      const readinessMatch = line.match(/^(FT\d+)\s*=\s*(RFU)[ -]*(.*)$/i);
      if (readinessMatch) {
        const [_, unit, __, location] = readinessMatch;
        units[unit] = units[unit] || { unit_id: unit, unit_type: 'FT' };
        units[unit].readiness_status = true;
        units[unit].readiness_location = location.trim();
        continue;
      }
  
      // SONDING
      const sondingMatch = line.match(/^(FT|MTG)(\d+)\s*=\s*([\d.,]+)?-?([\d.,]+)?$/i);
      if (sondingMatch) {
        const [_, prefix, num, awal, akhir] = sondingMatch;
        const key = prefix + num;
        units[key] = units[key] || { unit_id: key, unit_type: prefix as 'FT' | 'MTG' };
        if (awal) units[key].sonding_awal = parseFloat(awal.replace(',', '.'));
        if (akhir) units[key].sonding_akhir = parseFloat(akhir.replace(',', '.'));
        continue;
      }
  
      // FLOWMETER
      const flowMatch = line.match(/^(FT|MTG)(\d+)\s*=\s*([\d.,]+)?-?([\d.,]+)?[c]?$/i);
      if (flowMatch) {
        const [_, prefix, num, awal, akhir] = flowMatch;
        const key = prefix + num;
        units[key] = units[key] || { unit_id: key, unit_type: prefix as 'FT' | 'MTG' };
        if (awal) units[key].flowmeter_awal = parseFloat(awal.replace(',', '.'));
        if (akhir) units[key].flowmeter_akhir = parseFloat(akhir.replace(',', '.'));
        continue;
      }
    }
  
    // Finalize units and fill defaults
    const unitArray: DailyFAOUnitReport[] = Object.values(units).map(u => ({
      unit_id: u.unit_id!,
      unit_type: u.unit_type!,
      qty_out: u.qty_out ?? 0,
      qty_in: u.qty_in ?? 0,
      sonding_awal: u.sonding_awal ?? null,
      sonding_akhir: u.sonding_akhir ?? null,
      flowmeter_awal: u.flowmeter_awal ?? null,
      flowmeter_akhir: u.flowmeter_akhir ?? null,
      readiness_status: u.readiness_status ?? null,
      readiness_location: u.readiness_location ?? null,
      remark: u.remark ?? '',
    }));
  
    return {
      tanggal,
      shift,
      units: unitArray,
    };
  }
  
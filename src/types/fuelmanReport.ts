export interface FuelmanReport {
  tanggal: string;
  shift: number;
  issuing_out: Record<string, number>;
  total_out: number | null;
  ritasi: Record<string, number>;
  total_in: number | null;
  readiness: Record<string, string>;
  sonding: Record<string, { awal: number; akhir: number | null }>;
  flowmeter: Record<string, { awal: number; akhir: number | null }>;
  note: string;
}


export interface FuelmanDailyReport {
  report_date: string; // format: 'YYYY-MM-DD'
  shift: number;
  total_out: number | null;
  total_in: number | null;
  note: string;

  issuing_out: {
    unit_id: string;
    qty: number;
  }[];

  ritasi: {
    unit_id: string;
    qty: number;
  }[];

  readiness: {
    unit_id: string;
    location: string;
  }[];

  sonding: {
    unit_id: string;
    awal: number;
    akhir: number | null;
  }[];

  flowmeter: {
    unit_id: string;
    awal: number;
    akhir: number | null;
  }[];
}



export interface FuelmanSondingWithLiter {
  awal_cm: number | null;
  awal_liter: number | null;
  akhir_cm: number | null;
  akhir_liter: number | null;
}

export interface TunedFuelmanDailyReport extends FuelmanDailyReport {
  sonding_liter: Record<string, FuelmanSondingWithLiter>;
}

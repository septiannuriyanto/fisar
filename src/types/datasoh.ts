// types.ts
export interface DataSOH {
    storage_location: string;
    material_code: string;
    soh: number;
    date_snapshot: string;
    source : number;
    report_by: string;
  }
  

// Whitelist stock_code
export const whitelist = [5517]; // Ganti sesuai kebutuhan
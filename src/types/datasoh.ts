// types.ts
export interface DataSOH {
    id:string;
    wh_code: string;
    stock_code: number;
    qty: number;
    tgl: string;
    source : number;
    report_by: string;
  }
  

// Whitelist stock_code
export const whitelist = [5517]; // Ganti sesuai kebutuhan
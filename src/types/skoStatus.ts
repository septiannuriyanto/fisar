interface SkoStatus {
  unit_id: string;
  sko_code: string; // atau `number` jika kamu ingin
  expired_date: Date; // atau `Date` kalau kamu parse
  status_sko: 'VALID' | 'WILL EXPIRE' | 'EXPIRED';
  days_remaining: number;
}

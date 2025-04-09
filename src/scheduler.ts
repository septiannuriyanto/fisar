// src/scheduler.ts

import * as dotenv from 'dotenv';
dotenv.config();

export function isWithinShift(): boolean {
  const now = new Date();
  const hour = now.getHours();

  const shiftStart = parseInt(process.env.SHIFT_START || '6', 10); // default 6
  const shiftEnd = parseInt(process.env.SHIFT_END || '18', 10);    // default 18

  return hour >= shiftStart && hour < shiftEnd;
}

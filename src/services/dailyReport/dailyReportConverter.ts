import { FuelmanDailyReport, FuelmanReport } from "../../types/fuelmanReport";

export function convertFuelmanReportToDailyReport(report: FuelmanReport): FuelmanDailyReport {
  return {
    report_date: report.tanggal,
    shift: report.shift,
    total_out: report.total_out,
    total_in: report.total_in,
    note: report.note,

    issuing_out: Object.entries(report.issuing_out).map(([unit_id, qty]) => ({
      unit_id,
      qty,
    })),

    ritasi: Object.entries(report.ritasi).map(([unit_id, qty]) => ({
      unit_id,
      qty,
    })),

    readiness: Object.entries(report.readiness).map(([unit_id, location]) => ({
      unit_id,
      location,
    })),

    sonding: Object.entries(report.sonding).map(([unit_id, { awal, akhir }]) => ({
      unit_id,
      awal,
      akhir,
    })),

    flowmeter: Object.entries(report.flowmeter).map(([unit_id, { awal, akhir }]) => ({
      unit_id,
      awal,
      akhir,
    })),
  };
}

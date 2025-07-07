import { supabase } from "../../supabaseClient";
import { FuelmanDailyReport } from "../../types/fuelmanReport";
import { retryAsync } from "../retryAsync";


export async function insertFuelmanReport(report: FuelmanDailyReport) {
  try {
    // Step 1: Insert header
    const { data: headerData, error: headerError } = await supabase
      .from('fuel_daily_report')
      .insert({
        report_date: report.report_date,
        shift: report.shift,
        total_out: report.total_out,
        total_in: report.total_in,
        note: report.note,
      })
      .select('id')
      .single();

    if (headerError || !headerData) {
      console.error('❌ Error inserting report header:', headerError);
      throw headerError;
    }

    const reportId = headerData.id;

    // Helper function for bulk insert
    const bulkInsert = async (table: string, rows: object[]) => {
      if (rows.length === 0) return;
      const { error } = await supabase.from(table).insert(rows);
      if (error) {
        console.error(`❌ Error inserting into ${table}:`, error);
        throw error;
      }
    };

    // Step 2: Insert Issuing Out
    await bulkInsert('fuel_issuing_out', report.issuing_out.map(item => ({
      report_id: reportId,
      unit_id: item.unit_id,
      qty: item.qty,
    })));

    // Step 3: Insert Ritasi
    await bulkInsert('fuel_ritasi', report.ritasi.map(item => ({
      report_id: reportId,
      unit_id: item.unit_id,
      qty: item.qty,
    })));

    // Step 4: Insert Readiness
    await bulkInsert('fuel_readiness', report.readiness.map(item => ({
      report_id: reportId,
      unit_id: item.unit_id,
      location: item.location,
    })));

    // Step 5: Insert Sonding
    await bulkInsert('fuel_sonding', report.sonding.map(item => ({
      report_id: reportId,
      unit_id: item.unit_id,
      awal: item.awal,
      akhir: item.akhir,
      awal_liter: (item as any).awal_liter ?? null,  // Asumsi hasil tuning sudah masuk liter
      akhir_liter: (item as any).akhir_liter ?? null,
    })));

    // Step 6: Insert Flowmeter
    await bulkInsert('fuel_flowmeter', report.flowmeter.map(item => ({
      report_id: reportId,
      unit_id: item.unit_id,
      awal: item.awal,
      akhir: item.akhir,
    })));

    console.log('✅ Fuel report inserted successfully with report ID:', reportId);
    return reportId;

  } catch (error) {
    console.error('🔥 Failed to insert fuel report:', error);
    throw error;
  }
}




export async function insertFuelmanDailyReportWithRetry(report: FuelmanDailyReport) {
  return retryAsync(() => insertFuelmanReport(report), 5, 2000);
}

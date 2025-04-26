// ============================================================================================ PROCEDURE INSERT SOH 17RA

import { supabase } from "../../supabaseClient";
import { DataSOH } from "../../types/datasoh";
import { retryAsync } from "../retryAsync";

export async function insertSohReport(entries: DataSOH[]) {
    if (entries.length === 0) {
      console.warn('⚠️ No SOH records to insert.');
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('soh_report')
        .upsert(entries, { onConflict: 'id' });
  
      if (error) {
        console.error('❌ Failed to insert SOH data:', JSON.stringify(error, null, 2));
        throw new Error('Failed to insert SOH data');
      }
  
      console.log(`✅ Successfully inserted ${entries.length} SOH records.`);
      return data;
    } catch (error) {
      console.error('❌ An error occurred while inserting SOH data:', error);
      throw error;
    }
  }
  
  export async function insertSohReportWithRetry(entries: DataSOH[]) {
    try {
      return await retryAsync(() => insertSohReport(entries), 10, 3000);
    } catch (error) {
      console.error('❌ Error after retrying SOH data insertion:', error);
      throw error;
    }
  }
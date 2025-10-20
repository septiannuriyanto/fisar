// ============================================================================================ PROCEDURE INSERT OIL USAGE

import { OilUsageEntry } from "../../parsers/groupOliParser/groupOliParser";
import { supabase } from "../../supabaseClient";
import { retryAsync } from "../retryAsync";

export async function insertOilUsage(entries: OilUsageEntry[]) {
  if (entries.length === 0) {
    console.warn('⚠️ No oil usage records to insert.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('oil_usage') // ganti sesuai nama tabel kamu
      .insert(entries);

    if (error) {
      console.error('❌ Failed to insert oil usage data:', JSON.stringify(error, null, 2));
      throw new Error('Failed to insert oil usage data');
    }

    console.log(`✅ Successfully inserted ${entries.length} oil usage records.`);
    return data;
  } catch (error) {
    console.error('❌ An error occurred while inserting oil usage data:', error);
    throw error;
  }
}

export async function insertOilUsageWithRetry(entries: OilUsageEntry[]) {
  try {
    // Retry function for inserting oil usage data
    return await retryAsync(() => insertOilUsage(entries), 10, 3000);
  } catch (error) {
    console.error('❌ Error after retrying insertion:', error);
    throw error;
  }
}
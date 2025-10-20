// ============================================================================================ PROCEDURE INSERT SOH SYSTEM

import { supabase } from "../../supabaseClient";
import { DataSOH } from "../../types/datasoh";
import { retryAsync } from "../retryAsync";

export async function insertSohSystem(entries: DataSOH[]) {
  if (entries.length === 0) {
    console.warn("⚠️ No SOH records to insert.");
    return;
  }

  console.log(`🔄 Inserting ${entries.length} SOH records...`);

  try {
    const { data, error } = await supabase
      .from("soh_system")
      .upsert(entries, {
        onConflict: "storage_location, material_code, date_snapshot",
      });

    if (error) {
      console.error("❌ Failed to insert SOH data:", JSON.stringify(error, null, 2));
      throw new Error("Failed to insert SOH data");
    }

    console.log(`✅ Successfully inserted ${entries.length} SOH records.`);
    return data;
  } catch (error) {
    console.error("❌ An error occurred while inserting SOH data:", error);
    throw error;
  }
}

export async function insertSohSystemWithRetry(entries: DataSOH[]) {
  console.log(`🔄 Retrying insertion of ${entries.length} SOH records...`);
  
  try {
    return await retryAsync(() => insertSohSystem(entries), 10, 3000);
  } catch (error) {
    console.error("❌ Error after retrying SOH data insertion:", error);
    throw error;
  }
}

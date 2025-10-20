

// ============================================================================================ PROCEDURE UPDATE PO FUEL

import { formatTodayToYYYYmm } from "../../functions";
import { Excel221Data } from "../../jobs/readExcel221";
import { supabase } from "../../supabaseClient";
import { retryAsync } from "../retryAsync";

export async function getThisMonthPoNumber(){
  const { data, error } = await supabase
    .from('po_fuel')
    .select('po_number')
    .eq('period', formatTodayToYYYYmm()) // yyyy
    //yyyymm

    .limit(1);

  if (error) {
    console.error('❌ Failed to get PO number:', error);
    throw error;
  }

  return data;

}

export const syncPoFuelData = async (data221: Excel221Data[]) => {
  console.log(data221);
  
  const currentPoNumbers = data221.map((d) => d.po_number);

  console.log('Current PO Numbers:', currentPoNumbers);
  

  // 1. Update or insert current POs with remaining_qty and closed = false
  for (const item of data221) {
    const { po_number, remaining_qty } = item;

    const { error } = await supabase
      .from('po_fuel')
      .upsert(
        {
          po_number,
          remaining_qty,
          closed: false,
        },
        { onConflict: 'po_number' }
      );

    if (error) {
      console.error(`Failed to upsert ${po_number}:`, error.message);
    }
  }

  // 2. Fetch all existing PO numbers in the table
  const { data: allPoFuel, error: fetchError } = await supabase
    .from('po_fuel')
    .select('po_number');

  if (fetchError) {
    console.error('Failed to fetch po_fuel data:', fetchError.message);
    return;
  }

  const poToClose = allPoFuel
    .map((row) => row.po_number)
    .filter((po) => !currentPoNumbers.includes(po));

  // 3. Mark remaining_qty = 0 and closed = true for POs not in latest list
  for (const po_number of poToClose) {
    const { error } = await supabase
      .from('po_fuel')
      .update({
        remaining_qty: 0,
        closed: true,
      })
      .eq('po_number', po_number);

    if (error) {
      console.error(`Failed to mark closed for ${po_number}:`, error.message);
    }
  }
};


export async function syncPoFuelDataWithRetry(data221: Excel221Data[]) {
  try {
    return await retryAsync(() => syncPoFuelData(data221), 10, 3000);
  } catch (error) {
    console.error('❌ Error after retrying update PO Fuel:', error);
    throw error;
  }
}


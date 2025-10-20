import { ReconcilePayload } from "../../parsers/groupSupplerParser/parseRitasiReportNew";
import { supabase } from "../../supabaseClient";
import { retryAsync } from "../retryAsync";

// ============================================================================================
// INSERT RITASI KE PARENT + CHILD VIA RPC
export async function insertRitasiViaRPCNew(payload: ReconcilePayload) {
  console.log('📡 Mengirim payload ke RPC insert_reconcile_with_details:', JSON.stringify(payload, null, 2));


  console.log('📨 Payload type:', typeof payload);
console.log('📨 Payload preview:', payload);


  const { error } = await supabase.rpc('insert_reconcile_with_details', {
    payload,
  });

  if (error) {
    console.error('❌ RPC Failed:', error);
    throw error;
  }

  console.log('✅ RPC Success: Data inserted via RPC');
}

// ============================================================================================
// INSERT RITASI DENGAN RETRY
export async function insertRitasiWithRetryRPCNew(payload: ReconcilePayload) {
  return retryAsync(() => insertRitasiViaRPCNew(payload), 10, 3000); // Retry 10x dengan jeda 3 detik
}

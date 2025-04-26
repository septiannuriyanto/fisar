import { SupabaseClient } from "@supabase/supabase-js";
import { GROUP_LIST } from "../group-whitelist";
import { getSockInstance } from "../class/whatsapp-socket";
import { supabase } from "../supabaseClient";
import { formatTodayToYYmm, formatTodayToYYmmdd, formatTodayToYYYYmm } from "../functions";
import { headerMsg, signatureMsg } from "../class/constants";

export const checkAndNotifyPoFuelSummary = async (
  sock: any,
  po_period: number,
  reconcile_period: string,
  group_id: string,
  supabase:  SupabaseClient<any, "public", any>
) => {
  const { data: summary, error } = await supabase.rpc('get_reconcile_summary', {
    po_period,
    reconcile_period,
  });

  if (error) {
    throw new Error(`Supabase RPC Error: ${error.message}`);
  }


console.log(summary);


  const summaryMsg =
  `📊 *PO Fuel Summary*
  ✅ PO Received Qty: ${summary[0].po_received_qty}
  📦 Reconcile Qty  : ${summary[0].reconcile_received_qty}
  ⚠️ Pending Receive: ${summary[0].pending_receive}
  `
 

  console.log(
  );

  if (sock) {
    if (summary[0].pending_receive < 0) {
      const msg = `${headerMsg}${summaryMsg}\n\nPlease review, thank you.${signatureMsg}`;
      await sock.sendMessage(group_id, { text: msg });
    } else {
      const msg = `✅ Update PO Fuel completed at [${new Date().toLocaleString()}]\n📦 PO Received: ${summary[0].po_received_qty.toLocaleString()}\n🚛 Reconcile: ${summary[0].reconcile_received_qty.toLocaleString()}\n🧮 Pending Receive: ${summary[0].pending_receive.toLocaleString()}`;
      await sock.sendMessage(group_id, { text: msg });
    }
  }
};

export async function checkAndNotifyPoFuelSummaryToday(){
  const sock = getSockInstance();
  const po_period = Number(formatTodayToYYYYmm()); // Ganti dengan periode PO yang sesuai
            const reconcile_period = `G${formatTodayToYYmm()}`; // Ganti dengan periode rekonsiliasi yang sesuai
            console.log(`PO Period: ${po_period}, Reconcile Period: ${reconcile_period}`);
            
            const group_id = GROUP_LIST.ADMIN; // Ganti dengan ID grup yang sesuai
            try {
              await checkAndNotifyPoFuelSummary(sock, po_period, reconcile_period, group_id, supabase);
            } catch (error) {
              if (sock) {
                await sock.sendMessage(GROUP_LIST.TEST, { text: `❌ Error in checkAndNotifyPoFuelSummary: ${error}` });
              }
              throw new Error(`Error in checkAndNotifyPoFuelSummary: ${error}`);
              
            }
}
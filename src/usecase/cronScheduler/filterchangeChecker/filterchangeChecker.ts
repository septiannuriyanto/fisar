import { getSockInstance } from "../../../class/whatsapp-socket";
import { GROUP_LIST } from "../../../group-whitelist";
import { sendToTopic } from "../../../notifications/sendToTopic";
import { supabase } from "../../../supabaseClient";


export async function runFilterChangeChecker() {
  console.log("🚨 Running filter_change_alert cron...");
  try {
    const { data, error } = await supabase.rpc("get_filter_change");

    if (error || !data || data.length === 0) {
      console.log(error ? `❌ Error: ${error.message}` : '✅ No overdue filter changes.');
      return;
    }

    const message = `⚠️ *Filter Change Alert*\nUnit dengan filter >14 hari:\n` +
      data.map((row: any, i: number) =>
        `${i + 1}. *${row.unit_id}* | Terakhir: ${row.last_change_date} | ${row.days_elapsed} hari | Cost: ${row.filter_cost ?? "-"}`
      ).join('\n');

    const sock = getSockInstance();
    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, { text: message });
      await sendToTopic("filter_alert", "⚠️ Filter Belum Diganti!", `Ada ${data.length} unit yang terlambat ganti filter.`, { screen: "/" });
      console.log("✅ Alert sent to WhatsApp & Push Notification.");
    }
  } catch (e) {
    console.error("🔥 Exception in filterChangeAlert:", e);
  }
}

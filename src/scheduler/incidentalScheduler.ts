import cron from "node-cron";
import { supabase } from "../supabaseClient";
import { getSockInstance } from "../class/whatsapp-socket";
import { GROUP_LIST } from "../group-whitelist";

export function setupIncidentalJobs() {
  // Every hour test
  cron.schedule("0 * * * *", async () => {
    console.log("🧪 [TEST] Running hourly cron...");
    // implement test logic here
  });

}

// Tambahan: misal setiap 5 menit kirim heartbeat
// cron.schedule('*/5 * * * *', () => {...});

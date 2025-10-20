// src/scheduler/monthlyScheduler.ts
import cron from "node-cron";
import { getSockInstance } from "../class/whatsapp-socket";
import { GROUP_LIST } from "../group-whitelist";
import { supabase } from "../supabaseClient";
import { sendToTopic } from "../notifications/sendToTopic";


 export function setupDevelopmentJobs() {
console.log("🧪 [TEST] Running development cron...");
  // Setiap jam 8 pagi
  
}
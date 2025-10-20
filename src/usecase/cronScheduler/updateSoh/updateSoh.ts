import { getSockInstance } from "../../../class/whatsapp-socket";
import { GROUP_LIST } from "../../../group-whitelist";
import { readExcelAndFilter17RA } from "../../../jobs/readExcel17Ra";
import { insertSohSystemWithRetry } from "../../../services/updateSoh/updateSohServices";
import { copy17Ra, generateToday17RAFilePath } from "../../../utils/fileClient";


export async function runUpdateSohSystemJob() {
  const sock = getSockInstance();
  console.log('🚚 Running updateSystemStockOnHand...');

  try {
    await copy17Ra(); // salin file
    const data = await readExcelAndFilter17RA(generateToday17RAFilePath());
    await insertSohSystemWithRetry(data); // update ke Supabase

    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, { text: '✅ Update SOH Success' });
    }
  } catch (err) {
    console.error('❌ Error in 17RA:', err);
    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, { text: `❌ Update SOH Failed, ${err}` });
    }
  }
}

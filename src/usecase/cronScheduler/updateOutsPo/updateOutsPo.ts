import { getSockInstance } from "../../../class/whatsapp-socket";
import { GROUP_LIST } from "../../../group-whitelist";
import { copy221,  } from "../../../utils/fileClient";


export async function runUpdatePo221Job() {
  const sock = getSockInstance();
  console.log('🛠️ Running copy221...');

  try {
    await copy221(); // salin dan proses file 221

    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: `✅ Update PO Fuel completed at [${new Date().toLocaleString()}]`,
      });
    }
  } catch (err) {
    console.error('❌ Error in 221:', err);
    if (sock) {
      await sock.sendMessage(GROUP_LIST.TEST, {
        text: `❌ Update PO Failed, ${err}`,
      });
    }
  }
}

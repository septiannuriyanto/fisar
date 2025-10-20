// src/scheduler/monthlyScheduler.ts
import cron from 'node-cron';
import { getSockInstance } from '../class/whatsapp-socket';
import { GROUP_LIST } from '../group-whitelist';

export function setupMonthlyJobs() {
  // Setiap tanggal 1 pukul 08:00
  cron.schedule('0 8 1 * *', async () => {
    console.log('📆 [Monthly] Job running on day 1 at 08:00');
    const sock = getSockInstance();
    try {
      // Your logic here, e.g., monthly report, archive, cleanup
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, { text: '📢 Monthly job done!' });
      }
    } catch (err) {
      console.error('❌ Monthly job error:', err);
    }
  });
}

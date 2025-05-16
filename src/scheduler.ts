// src/scheduler.ts
import cron from 'node-cron';
import * as dotenv from 'dotenv';
dotenv.config();

export function isWithinShift(): boolean {
  const now = new Date();
  const hour = now.getHours();

  const shiftStart = parseInt(process.env.SHIFT_START || '6', 10); // default 6
  const shiftEnd = parseInt(process.env.SHIFT_END || '18', 10);    // default 18

  return hour >= shiftStart && hour < shiftEnd;
}


import { updateSystemStockOnHand } from './jobs/updateSystemStockOnHand';
import { cekFilterUsedDays } from './jobs/cekFilterUsedDays';
import { getSockInstance } from './class/whatsapp-socket';
import { GROUP_LIST } from './group-whitelist';
import { copy17Ra, copy221, generateToday17RAFilePath, generateToday221FilePath } from './utils/fileClient';
import { readExcelAndFilter17RA } from './jobs/readExcel17Ra';
import { readExcelAndFilter221 } from './jobs/readExcel221';
import { checkAndNotifyPoFuelSummaryToday } from './jobs/checkAndNotifyPoFuelSummary';
import { supabase } from './supabaseClient';
import { insertSohReportWithRetry } from './services/updateSoh/updateSohServices';
import { syncPoFuelDataWithRetry } from './services/updatePo/updatePoService';

export function startCronJobs() {
  // 🔁 Harian jam 09:00
  cron.schedule('0 9 * * *', async () => {
    console.log('🚚 Running updateSystemStockOnHand...');
    try {
      await updateSystemStockOnHand();
      console.log('✅ updateSystemStockOnHand completed.');
    } catch (err) {
      console.error('❌ Error in updateSystemStockOnHand:', err);
    }
  });

  // 🔁 Harian jam 06:00
  cron.schedule('0 6 * * *', async () => {
    console.log('🛠️ Running cekFilterUsedDays...');
    try {
      await cekFilterUsedDays();
      console.log('✅ cekFilterUsedDays completed.');
    } catch (err) {
      console.error('❌ Error in cekFilterUsedDays:', err);
    }
  });


    // 🔁 Cron untuk download 17RA
    cron.schedule('0 9 * * *', async () => {
      const sock = getSockInstance();
      console.log('🛠️ Cron Download 17RA running [every 09:00] daily...');
      try {
        await copy17Ra();
        console.log(`✅ Download 17RA completed at [${new Date().toLocaleString()}]`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
        const data = readExcelAndFilter17RA(generateToday17RAFilePath());
        await insertSohReportWithRetry(data);

        //Update logging to whatsapp group
       
        if(sock){
          await sock.sendMessage(GROUP_LIST.TEST, { text : "✅ Update SOH Success" });
          return;
        }
        
      } catch (err) {
        console.error('❌ Error in downloading 17RA:', err);
        //Update logging to whatsapp group
        if(sock){
          await sock.sendMessage(GROUP_LIST.TEST, { text : `❌ Update SOH Failed, ${err}` });
          return;
        }
      }
    });

  // 🔁 Cron untuk download 221 dan update sisa PO Fuel yang ada
  cron.schedule('1 9 * * *', async () => {
    const sock = getSockInstance();
    console.log('🛠️ Cron Download Outs PO running [every 09:01] daily...');
    try {
      await copy221();
      console.log(`✅ Download 221 completed at [${new Date().toLocaleString()}]`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
      

      //Update logging to whatsapp group
     
      if(sock){
        await sock.sendMessage(GROUP_LIST.TEST, { text : `✅ Update PO Fuel completed at [${new Date().toLocaleString()}]` });
        return;
      }
      
    } catch (err) {
      console.error('❌ Error in downloading 17RA:', err);
      //Update logging to whatsapp group
      if(sock){
        await sock.sendMessage(GROUP_LIST.TEST, { text : `❌ Update SOH Failed, ${err}` });
        return;
      }
    }
  });

  // 🔁 Cron untuk update summary PO Fuel
  cron.schedule('2 9 * * *', async () => {
    console.log('🛠️ Cron Update PO Fuel Summary running [every 09:02] daily...');
    try {
      await checkAndNotifyPoFuelSummaryToday()
      console.log(`✅ Update PO Fuel Summary completed at [${new Date().toLocaleString()}]`);
    } catch (err) {
      console.error('❌ Error in updating PO Fuel Summary:', err);
    }
  });
  // 🔁 Cron untuk update summary PO Fuel
  cron.schedule('37 14 * * *', async () => {
    console.log('🛠️ Cron Update PO Fuel Summary running [every 13:01] daily...');
    try {
      await checkAndNotifyPoFuelSummaryToday()
      console.log(`✅ Update PO Fuel Summary completed at [${new Date().toLocaleString()}]`);
    } catch (err) {
      console.error('❌ Error in updating PO Fuel Summary:', err);
    }
  });

  // ⚙️ TEST: Cek filter setiap 1 menit
  // cron.schedule('* * * * *', async () => {
    // console.log('🧪 [TEST] Running cron job checks (every minute)...');
    // try {
    //   await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
    //     const sock = getSockInstance();
    //     if(sock){
    //       // console.log('Sending message to test group : ', GROUP_LIST.TEST);
    //       // console.log(readExcelAndFilter(generateToday17RAFilePath()));
          
    //       // await sock.sendMessage(GROUP_LIST.TEST, { text : "[TEST] Running cron job checks (every minute)..." });
    //       return;
    //     }
    //     throw new Error('Sock instance is not available');

    //   console.log('✅ Cron job test done.');
    // } catch (err) {
    //   console.error('❌ Error in cron job test:', err);
    // }
  // });

   // ⚙️ TEST: Cek filter setiap 1 jam
   cron.schedule('0 * * * *', async () => {
    console.log('🧪 [TEST] Running cron job checks (every hour)...');
    // try {
    //   await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate async operation
    //     const sock = getSockInstance();
    //     if(sock){
    //       // console.log('Sending message to test group : ', GROUP_LIST.TEST);
    //       // await sock.sendMessage(GROUP_LIST.TEST, { text : "[TEST] Running cron job checks (every hour)..." });
    //       return;
    //     }
    //     throw new Error('Sock instance is not available');

    //   console.log('✅ Cron job test done.');
    // } catch (err) {
    //   console.error('❌ Error in cron job test:', err);
    // }
  });
}


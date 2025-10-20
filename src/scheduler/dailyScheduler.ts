import cron from 'node-cron';
import { checkAndNotifyPoFuelSummaryToday } from '../jobs/checkAndNotifyPoFuelSummary';
import { runFilterChangeChecker } from '../usecase/cronScheduler/filterchangeChecker/filterchangeChecker';
import { runUpdateSohSystemJob } from '../usecase/cronScheduler/updateSoh/updateSoh';
import { runUpdatePo221Job } from '../usecase/cronScheduler/updateOutsPo/updateOutsPo';
import { runCheckSkoStatusJob } from '../usecase/cronScheduler/checkSkoStatus/runCheckSkoStatus';
import { odosReminder } from '../usecase/cronScheduler/odos/odosReminder';
import { dailyCheckFtReminder } from '../usecase/cronScheduler/dailyCheckFt/dailyCheckFtReminder';
import { GROUP_WHITELIST } from '../group-whitelist';
import { getSockInstance } from '../class/whatsapp-socket';
import { refuelingScheduleReminder } from '../services/refuelingSchedule/refuelingSchedule';

const odosScheduleMap = [
  { time: '0 9 * * *', period: 'morning' },
  { time: '0 14 * * *', period: 'noon' },
  { time: '0 16 * * *', period: 'evening' },
] as const


export function setupDailyJobs() {

  // misalnya kirim tiap jam 5:30 pagi untuk shift 1
cron.schedule('40 5 * * *', async () => {
  await refuelingScheduleReminder({ shift: 1 });
});

  // 05:55 - FILTER CHANGE CHECKER
  cron.schedule("55 5 * * *",  runFilterChangeChecker);

  // 06:00 - DAILY CHECK FT
  cron.schedule("0 6 * * *", async () => {
    const sock = getSockInstance?.();
    if (!sock) {
      console.error("❌ WhatsApp socket not available for dailyCheckFtReminder.");
      return;
    }
    await dailyCheckFtReminder({
      message: '',
      sock,
      groupId: GROUP_WHITELIST.FAO,
    });
  });

  // 07:00 - CHECK SKO UNIT
  cron.schedule('0 7 * * *', runCheckSkoStatusJob);

  // 09:00 - UPDATE SYSTEM STOCK ON HAND
  cron.schedule('50 8 * * *', runUpdateSohSystemJob);

  // 09:01 - UPDATE OUTSTANDING PO
  // cron.schedule('55 8 * * *', runUpdatePo221Job);

  // 09:02 & 14:37 - ARLIDA
  // ['2 9 * * *', '37 14 * * *'].forEach((pattern) =>
  //   cron.schedule(pattern, async () => {
  //     console.log('🛠️ Running checkAndNotifyPoFuelSummaryToday...');
  //     try {
  //       await checkAndNotifyPoFuelSummaryToday();
  //     } catch (err) {
  //       console.error('❌ Error in PO Summary:', err);
  //     }
  //   })
  // );


// atau jam 17:00 untuk shift 2
cron.schedule('0 17 * * *', async () => {
  await refuelingScheduleReminder({ shift: 2 });
});



// Daily reminders for ODOS
odosScheduleMap.forEach(({ time, period }) => {
  cron.schedule(time, () => odosReminder({ timeOfDay: period }))
})
}

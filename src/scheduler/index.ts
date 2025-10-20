import { setupDailyJobs } from './dailyScheduler';
import { setupIncidentalJobs } from './incidentalScheduler';
import { setupWeeklyJobs } from './weeklyScheduler';
import { setupMonthlyJobs } from './monthlyScheduler';
import { setupDevelopmentJobs } from './developmentScheduler';

export function startCronJobs() {
  console.log('🕒 Starting cron job scheduler...');
  setupDailyJobs();
  setupIncidentalJobs();

  if (process.env.ENABLE_WEEKLY_JOBS === 'true') {
    console.log('✅ Weekly jobs enabled');
    setupWeeklyJobs();
  } else {
    console.log('⛔ Weekly jobs disabled');
  }

  if (process.env.ENABLE_MONTHLY_JOBS === 'true') {
    console.log('✅ Monthly jobs enabled');
    setupMonthlyJobs();
  } else {
    console.log('⛔ Monthly jobs disabled');
  }
  if (process.env.ENABLE_DEVELOPMENT_JOBS === 'true') {
    console.log('✅ Development jobs enabled');
    setupDevelopmentJobs();
  } else {
    console.log('⛔ Development jobs disabled');
  }
}

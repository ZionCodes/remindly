import cron from 'node-cron';
import { checkReminders } from '$lib/server/checkReminders';

export function setupCronJobs() {
  console.log('Setting up cron jobs...');
  
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('Running reminder check...');
    try {
      await checkReminders();
      console.log('Reminder check completed.');
    } catch (error) {
      console.error('Error in cron job:', error);
    }
  });

  console.log('Cron jobs set up successfully.');
}
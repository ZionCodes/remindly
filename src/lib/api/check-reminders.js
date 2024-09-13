import { checkReminders } from '$lib/server/checkReminders';

export const GET = async () => {
  try {
    await checkReminders();
    return new Response('Reminders checked and notifications sent', {
      status: 200
    });
  } catch (error) {
    console.error('Error checking reminders:', error);
    return new Response('Error checking reminders: ' + error.message, {
      status: 500
    });
  }
};
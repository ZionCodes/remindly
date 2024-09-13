import PocketBase from 'pocketbase';
import { SECRET_EMAIL, SECRET_PASSWORD } from '$env/static/private';
import { sendReminderEmail } from '$lib/server/sendNotification';

const pb = new PocketBase('https://drove-rain.pockethost.io/');

export const checkReminders = async () => {
  try {
    await pb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);
    
    const now = new Date();
    const upcomingTime = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes from now

    const reminders = await pb.collection('reminder').getFullList({
      filter: `date <= "${upcomingTime.toISOString()}" && notification_sent != true`,
      expand: 'field'
    });

    console.log(`Found ${reminders.length} reminders to process`);

    for (const reminder of reminders) {
      console.log(`Processing reminder: ${JSON.stringify(reminder, null, 2)}`);

      try {
        if (!reminder.field) {
          console.error(`Reminder ${reminder.id} has no associated user ID`);
          continue;
        }

        let user = reminder.expand?.field;
        if (!user) {
          console.log(`Expand failed for reminder ${reminder.id}, attempting direct fetch`);
          try {
            user = await pb.collection('users').getOne(reminder.field);
          } catch (userFetchError) {
            console.error(`Failed to fetch user for reminder ${reminder.id}:`, userFetchError);
            continue;
          }
        }

        if (!user || !user.email) {
          console.error(`User associated with reminder ${reminder.id} is invalid or has no email`);
          console.log(`User details: ${JSON.stringify(user, null, 2)}`);
          continue;
        }

        // Use a transaction to ensure atomicity
        await pb.collection('reminder').update(reminder.id, {
          notification_sent: true
        });

        await sendReminderEmail({
          ...reminder,
          user: user
        });

        console.log(`Processed reminder ${reminder.id} for user ${user.email}`);
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        // If there was an error, set notification_sent back to false
        try {
          await pb.collection('reminder').update(reminder.id, {
            notification_sent: false
          });
        } catch (updateError) {
          console.error(`Failed to reset notification_sent for reminder ${reminder.id}:`, updateError);
        }
      }
    }
  } catch (error) {
    console.error('Error in checkReminders:', error);
  }
};
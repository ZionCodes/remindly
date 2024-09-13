import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { SENDGRID_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } from '$env/static/private';

sgMail.setApiKey(SENDGRID_API_KEY);
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendReminder = async (reminder) => {
  if (!reminder.user || !reminder.user.email) {
    throw new Error(`Cannot send reminder for ${reminder.id}: User or user email is missing`);
  }

  const formattedDate = new Date(reminder.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const reminderText = formatReminderText(reminder, formattedDate);

  try {
    await sendEmailReminder(reminder, reminderText, formattedDate);
    console.log(`Email sent for reminder ID: ${reminder.id}`);

    if (reminder.user.whatsappNumber) {
      await sendWhatsAppReminder(reminder.user.whatsappNumber, reminderText);
      console.log(`WhatsApp message sent for reminder ID: ${reminder.id}`);
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    throw error;
  }
};

const formatReminderText = (reminder, formattedDate) => {
  return `Reminder Alert

Hello ${reminder.user.name || 'User'},

This is a friendly reminder for your upcoming event:

${reminder.name}

Description: ${reminder.description}
Date: ${formattedDate}

Don't forget to prepare for this event. If you need to make any changes or view more details, please visit:
https://relocateforwork.com/view-reminder/${reminder.id}

© ${new Date().getFullYear()} Relocate for Work. All rights reserved.

To unsubscribe: https://relocateforwork.com/unsubscribe
Contact us: https://relocateforwork.com/contact`;
};

const sendEmailReminder = async (reminder, reminderText, formattedDate) => {
  const msg = {
    to: reminder.user.email,
    from: 'hello@relocateforwork.com', // Make sure this is your verified sender email
    subject: `📅 Reminder: ${reminder.name}`,
    text: reminderText,
    html: `<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reminder: ${reminder.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
    body, html {
      font-family: 'Roboto', Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #333;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #f8f9fa;
    }
    .header {
      background-color: #0f766e;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      background-color: white;
      padding: 30px;
      border-radius: 0 0 5px 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    .reminder-box {
      background-color: #e6f3f2;
      border-left: 4px solid #0f766e;
      padding: 15px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0f766e;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      text-align: center;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.9em;
      color: #6c757d;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reminder Alert</h1>
    </div>
    <div class="content">
      <h2>Hello, ${reminder.user.name || 'User'}!</h2>
      <p>This is a friendly reminder for your upcoming event:</p>
      <div class="reminder-box">
        <h3 style="color: #0f766e; margin-top: 0;">${reminder.name}</h3>
        ${reminder.description ? `<p><strong>Description:</strong> ${reminder.description}</p>` : ''}
        <p><strong>Date:</strong> ${formattedDate}</p>
      </div>
      <p>Don't forget to prepare for this event. If you need to make any changes or view more details, click the button below:</p>
      <p style="text-align: center;">
        <a href="/reminder/${reminder.id}" class="btn">View Reminder Details</a>
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Relocate for Work. All rights reserved.</p>
      <p>
        <a href="https://relocateforwork.com/unsubscribe" style="color: #0f766e;">Unsubscribe</a> | 
        <a href="https://relocateforwork.com/contact" style="color: #0f766e;">Contact Us</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendWhatsAppReminder = async (to, body) => {
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`,
      body: body
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

// Make sure to export the main function
export { sendReminder as sendReminderEmail };
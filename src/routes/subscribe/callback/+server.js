import { json } from '@sveltejs/kit';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';
import https from 'https';

export async function GET({ url }) {
  const { searchParams } = url;
  const trxref = searchParams.get('trxref');

  // Verify the payment with Paystack
  const verificationResponse = await verifyPaystackTransaction(trxref);

  if (verificationResponse.status) {
    // Payment was successful, handle the subscription creation or update in your app
    // You can store the subscription data in Pocketbase here
    return json({ message: 'Payment successful' });
    // throw redirect(302, '/');
  } else {
    return json({ message: 'Payment failed', error: verificationResponse.message }, { status: 400 });
  }
}

async function verifyPaystackTransaction(trxref) {
  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${trxref}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  };

  return new Promise((resolve, reject) => {
    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          console.error('Error parsing Paystack response:', error);
          reject(new Error('Invalid response from Paystack'));
        }
      });
    }).on('error', (error) => {
      console.error('HTTPS request error:', error);
      reject(error);
    });
  });
}
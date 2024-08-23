import { json } from '@sveltejs/kit';
import https from 'https';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';

function makePaystackRequest(options, params) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log(`Paystack API Response (${options.path}):`, data);
                try {
                    resolve(JSON.parse(data));
                } catch (error) {
                    console.error('Error parsing Paystack response:', error);
                    console.log('Raw Paystack response:', data);
                    reject(new Error('Invalid response from Paystack'));
                }
            });
        }).on('error', error => {
            console.error('HTTPS request error:', error);
            reject(error);
        });

        if (params) {
            console.log(`Paystack API Request (${options.path}):`, params);
            req.write(params);
        }
        req.end();
    });
}

export async function POST({ request }) {
    try {
        const { planCode, email, amount } = await request.json();
        console.log('Received request:', { planCode, email, amount });

        // Step 1: Initialize a transaction for the subscription with a callback URL
        const transactionParams = JSON.stringify({
            email,
            plan: planCode,
            amount: Math.round(amount * 100), // Ensure amount is included here
            callback_url: 'http://localhost:5173/callback' // Include your callback URL here
        });

        const transactionOptions = {
            hostname: 'api.paystack.co',
            port: 443,
            path: '/transaction/initialize',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const transactionResponse = await makePaystackRequest(transactionOptions, transactionParams);

        if (!transactionResponse.status) {
            console.error('Paystack transaction initialization failed:', transactionResponse);
            return json({ status: false, error: transactionResponse.message || 'Failed to initialize transaction' }, { status: 400 });
        }

        console.log('Transaction initialized successfully:', transactionResponse.data);
        return json(transactionResponse);
    } catch (error) {
        console.error('Server error:', error);
        return json({ status: false, error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

import { redirect } from '@sveltejs/kit';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';

export const load = async ({ url }) => {
    const trxref = url.searchParams.get('trxref');
    const reference = url.searchParams.get('reference');

    if (!trxref || !reference) {
        throw redirect(302, '/reminder?status=error');
    }

    try {
        // Verify the transaction
        const verificationResponse = await verifyPaystackTransaction(reference);

        if (verificationResponse.status && verificationResponse.data.status === 'success') {
            // Payment successful
            throw redirect(302, '/reminder?status=success');
        } else {
            // Payment failed or pending
            throw redirect(302, '/reminder?status=failed');
        }
    } catch (error) {
        console.error('Error verifying transaction:', error);
        throw redirect(302, '/reminder?status=error');
    }
};

async function verifyPaystackTransaction(reference) {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to verify transaction');
    }

    return response.json();
}
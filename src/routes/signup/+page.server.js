import { fail, redirect } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { SECRET_EMAIL, SECRET_PASSWORD } from '$env/static/private';



export const actions = {
    register: async ({ locals, request }) => {
        const body = Object.fromEntries(await request.formData());

        try {
            // Attempt to create the user
            const user = await locals.pb.collection('users').create(body);

            // If successful, proceed with email verification and subscription creation
            await locals.pb.collection('users').requestVerification(body.email);

            const adminPb = new PocketBase('https://drove-rain.pockethost.io/');
            await adminPb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);

            // Create a subscription record for the new user using admin authentication
            await adminPb.collection('subscriptions').create({
                field: user.id,
                name: 'free'
            });

            // Redirect to the login page after successful registration
            throw redirect(303, '/login');
        } catch (err) {
            if (err.status === 303) {
                throw err; // Re-throw the redirect
            }

            console.log('Error details:', JSON.stringify(err, null, 2)); // Log the full error

            // Extract the specific error message
            let errorMessage = 'Something went wrong. Please try again.';
            if (err.response?.data?.email?.message) {
                errorMessage = err.response.data.email.message;
            } else if (err.response?.message) {
                errorMessage = err.response.message;
            }

            // Log the extracted error message
            console.log('Extracted Error Message:', errorMessage);

            // Return the specific error message
            return fail(400, {
                error: errorMessage,
                data: body
            });
        }
    }
};

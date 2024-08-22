import { SECRET_EMAIL, SECRET_PASSWORD } from '$env/static/private';
import PocketBase from 'pocketbase';
import { redirect, error } from '@sveltejs/kit';

const pb = new PocketBase('https://drove-rain.pockethost.io/');
await pb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);

export async function load({ locals }) {
    if (!locals.user) {
        throw redirect(303, '/login');
    }
    
    try {
        // Fetch reminders for the current user
        const records = await pb.collection('reminder').getFullList({
            sort: '-created',
            filter: `field = "${locals.user.id}"`,
        });

        return { records };
    } catch (err) {
        console.error('Error fetching reminders:', err);
        throw error(500, 'Failed to fetch reminders');
    }
}

export const actions = {
    create: async ({ request, locals }) => {
        try {
            // Initialize PocketBase instance and authenticate
            const pb = new PocketBase('https://drove-rain.pockethost.io/');
            await pb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);

            // Parse form data
            const formData = await request.formData();

            // Extract form fields and user ID
            const name = formData.get('name');
            const description = formData.get('description');
            const date = formData.get('date');
            const field = locals.user.id;
            const offset = formData.get('offset');

            // Construct reminder object
            const reminder = {
                name,
                description,
                date,
                field,
                offset
            };

            // Create a new reminder record in PocketBase
            const record = await pb.collection('reminder').create(reminder);

            // Return the created record or ID
            return {
                status: 200,
                body: record
            };

        } catch (error) {
            console.error('Error creating reminder:', error);
            // Return error response
            return {
                status: 500,
                body: { error: 'Failed to create reminder.' }
            };
        }
    },
}
import { SECRET_EMAIL, SECRET_PASSWORD } from '$env/static/private';
import PocketBase from 'pocketbase';
import { error, json } from '@sveltejs/kit';

export async function load({ params }) {
    const pb = new PocketBase('https://drove-rain.pockethost.io/');
    await pb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);

    try {
        const record = await pb.collection('reminder').getOne(params.id);
        console.log(record);
        return { record };
    } catch (err) {
        console.error('Failed to fetch record:', err);
        throw error(404, 'Record not found');
    }
}

export const actions = {
    update: async ({ request, locals }) => {
        try {
            const pb = new PocketBase('https://drove-rain.pockethost.io/');
            await pb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);

            // Parse form data
            const formData = await request.formData();
            console.log(formData);

            // Extract form fields and user ID
            const id = formData.get('id')
            const name = formData.get('name');
            const description = formData.get('description');
            const date = formData.get('date');
            const field = locals.user.id;

            // Construct reminder object
            const reminder = {
                id,
                name,
                description,
                date,
                field
            };

            // Update reminder in PocketBase
            const record = await pb.collection('reminder').update(id, reminder);

            // Return the created record or ID
            return {
                status: 200,
                body: record
            };
        }
        catch (error) {
            console.error('Error updating reminder:', error);
            return {
                status: 500,
                body: { error: 'Failed to create reminder.'}
            }
        }
    },

    delete: async ({ request }) => {
        try {
            const pb = new PocketBase('https://drove-rain.pockethost.io/');
            await pb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);

            const formData = await request.formData();
            const id = formData.get('id');

            await pb.collection('reminder').delete(id);

            // Return a success status code and message
            return json({ success: true, message: 'Reminder deleted successfully' }, { status: 200 });
        }
        catch (error) {
            console.error('Error deleting reminder:', error);
            // Return an error status code and message
            return json({ success: false, error: 'Failed to delete reminder.' }, { status: 500 });
        }
    }
}
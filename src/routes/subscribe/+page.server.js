import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    console.log('Current logged in user email:', locals.user.email);

    return {
        userEmail: locals.user.email
    };
};
import { fail } from '@sveltejs/kit';

export const actions = {
    login: async ({ request, locals }) => {
        const body = Object.fromEntries(await request.formData());

        try {
            await locals.pb.collection('users').authWithPassword(body.email, body.password);
            if (!locals.pb?.authStore?.model?.verified) {
                locals.pb.authStore.clear();
                return fail(400, {
                    notVerified: true,
                    email: body.email
                });
            }
            // Successful login
            return { success: true };
        } catch (err) {
            console.log('Error: ', err);
            if (err.status === 400) {
                return fail(400, {
                    error: 'Invalid email or password',
                    email: body.email
                });
            }
            return fail(500, { error: 'Something went wrong logging in' });
        }
    }
};
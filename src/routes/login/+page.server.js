import { error, fail } from '@sveltejs/kit';

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
        } catch (err) {
            console.log('Error: ', err);
            if (err.status === 400) {
                return fail(400, {
                    error: 'Invalid email or password',
                    email: body.email
                });
            }
            throw error(500, 'Something went wrong logging in');
        }

        return { success: true };
    }
};
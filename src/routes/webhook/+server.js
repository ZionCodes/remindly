import PocketBase from 'pocketbase';
import { SECRET_EMAIL, SECRET_PASSWORD } from '$env/static/private';

const pb = new PocketBase('https://drove-rain.pockethost.io');

async function initPocketBaseClient() {
  try {
    await pb.admins.authWithPassword(SECRET_EMAIL, SECRET_PASSWORD);
    console.log('Successfully authenticated with PocketBase');
  } catch (error) {
    console.error('Error authenticating with PocketBase:', error);
    throw error;
  }
}

await initPocketBaseClient();

export async function POST({ request }) {
  try {
    const body = await request.json();
    console.log('Received webhook data:', JSON.stringify(body, null, 2));

    const { event, data } = body;

    if (event === 'subscription.create') {
      console.log('Processing subscription.create webhook');

      const {
        status,
        amount,
        next_payment_date,
        createdAt,
        plan: { name, plan_code, interval },
        customer: { email },
        subscription_code
      } = data;

      console.log('Extracted subscription data:', {
        status,
        amount,
        next_payment_date,
        createdAt,
        plan: { name, plan_code, interval },
        customer: { email },
        subscription_code
      });

      let userId = null;
      try {
        const user = await pb.collection('users').getFirstListItem(`email="${email}"`);
        userId = user.id;
        console.log('Found user with ID:', userId);
      } catch (error) {
        console.error(`Error fetching user with email ${email}:`, error);
        return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
      }

      const subscriptionData = {
        field: userId,
        status,
        price: amount,
        next_payment_date,
        name,
        plan_code,
        interval,
        paystack_subscription_code: subscription_code,
        created_at: createdAt,
        last_payment_date: createdAt
      };

      console.log('Prepared subscription data for PocketBase:', subscriptionData);

      try {
        console.log('Searching for existing subscription for user:', userId);
        const existingSubscription = await pb.collection('subscriptions').getFirstListItem(`field="${userId}"`);
        console.log('Found existing subscription:', existingSubscription);

        console.log('Updating subscription in PocketBase');
        const updatedSubscription = await pb.collection('subscriptions').update(existingSubscription.id, subscriptionData);
        console.log('Updated subscription in PocketBase:', JSON.stringify(updatedSubscription, null, 2));

        return new Response(JSON.stringify({ 
          message: 'Subscription created and updated successfully', 
          data: updatedSubscription 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error updating subscription in PocketBase:', error);
        return new Response(JSON.stringify({ message: 'Error updating subscription' }), { status: 500 });
      }
    } else if (event === 'charge.success') {
      console.log('Processing charge.success webhook');

      const {
        amount,
        paid_at,
        created_at,
        customer: { email },
        plan: { name, plan_code, interval }
      } = data;

      console.log('Extracted charge data:', {
        amount,
        paid_at,
        created_at,
        email,
        name,
        plan_code,
        interval
      });

      let userId = null;
      try {
        const user = await pb.collection('users').getFirstListItem(`email="${email}"`);
        userId = user.id;
        console.log('Found user with ID:', userId);
      } catch (error) {
        console.error(`Error fetching user with email ${email}:`, error);
        return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
      }

      try {
        console.log('Searching for existing subscription for user:', userId);
        const existingSubscription = await pb.collection('subscriptions').getFirstListItem(`field="${userId}"`);
        console.log('Found existing subscription:', existingSubscription);

        const updateData = {
          last_payment_date: paid_at,
          status: 'active',
          name: name,
          plan_code: plan_code,
          price: amount,
          interval: interval,
          created_at: created_at
        };

        console.log('Updating subscription in PocketBase');
        const updatedSubscription = await pb.collection('subscriptions').update(existingSubscription.id, updateData);
        console.log('Updated subscription in PocketBase:', JSON.stringify(updatedSubscription, null, 2));

        return new Response(JSON.stringify({ 
          message: 'Charge processed and subscription updated successfully', 
          data: updatedSubscription 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error updating subscription in PocketBase:', error);
        return new Response(JSON.stringify({ message: 'Error updating subscription' }), { status: 500 });
      }
    } else if (event === 'subscription.disable') {
      console.log('Processing subscription.disable webhook');

      const {
        status,
        customer: { email },
        subscription_code
      } = data;

      console.log('Extracted subscription disable data:', {
        status,
        email,
        subscription_code
      });

      let userId = null;
      try {
        const user = await pb.collection('users').getFirstListItem(`email="${email}"`);
        userId = user.id;
        console.log('Found user with ID:', userId);
      } catch (error) {
        console.error(`Error fetching user with email ${email}:`, error);
        return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
      }

      try {
        console.log('Searching for existing subscription for user:', userId);
        const existingSubscription = await pb.collection('subscriptions').getFirstListItem(`field="${userId}"`);
        console.log('Found existing subscription:', existingSubscription);

        const updateData = {
          status: status,
          paystack_subscription_code: subscription_code
        };

        console.log('Updating subscription in PocketBase');
        const updatedSubscription = await pb.collection('subscriptions').update(existingSubscription.id, updateData);
        console.log('Updated subscription in PocketBase:', JSON.stringify(updatedSubscription, null, 2));

        return new Response(JSON.stringify({ 
          message: 'Subscription disabled and updated successfully', 
          data: updatedSubscription 
        }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error updating subscription in PocketBase:', error);
        return new Response(JSON.stringify({ message: 'Error updating subscription' }), { status: 500 });
      }
    } else {
      console.log('Received unhandled webhook event:', event);
      return new Response(JSON.stringify({ message: 'Webhook received and logged' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
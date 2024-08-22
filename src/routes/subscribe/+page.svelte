<script>
    import { onMount } from 'svelte';

    export let data;
    console.log('User email:', data.userEmail);

    let selectedPlan = 'basic';
    let selectedBilling = 'monthly';
    let paystackResponse = null;
    let errorMessage = null;
    let rawServerResponse = null;

    const plans = {
        basic: {
            name: 'Basic',
            monthly: {
                price: 4.99,
                planCode: 'PLN_49pkyi76oa3je95'
            },
        },
        pro: {
            name: 'Pro',
            monthly: {
                price: 9.99,
                planCode: 'PLN_hwr7a2kejnwpl6d'
            },
        }
    };

    $: currentPrice = plans[selectedPlan][selectedBilling].price;
    $: currentPlanCode = plans[selectedPlan][selectedBilling].planCode;

    async function subscribeToPlan(planCode, amount, email) {
        const params = JSON.stringify({
            planCode: planCode,
            amount: amount,
            email: email
        });

        try {
            const response = await fetch('/api/create-plan-and-subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: params
            });

            const responseText = await response.text();
            console.log('Raw server response:', responseText);
            rawServerResponse = responseText;

            try {
                const data = JSON.parse(responseText);
                console.log('Parsed Paystack response:', data);
                return data;
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                return { status: false, error: 'Invalid server response', rawResponse: responseText };
            }
        } catch (error) {
            console.error('Error subscribing to plan:', error);
            return { status: false, error: error.message };
        }
    }

    async function handleSubscribe(plan) {
        errorMessage = null;
        rawServerResponse = null;

        paystackResponse = await subscribeToPlan(plan[selectedBilling].planCode, plan[selectedBilling].price, data.userEmail);

        if (paystackResponse && paystackResponse.status) {
            // Here you can redirect to Paystack checkout page
            window.location.href = paystackResponse.data.authorization_url;
        } else {
            errorMessage = paystackResponse.error || 'An unknown error occurred';
            rawServerResponse = paystackResponse.rawResponse || null;
        }
    }

    onMount(() => {
        // Any initialization code can go here
    });
</script>

<section class="bg-gray-100 py-12">
    <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-center mb-8">Choose Your Plan</h1>
        
        <p class="text-center mb-4">Logged in as: {data.userEmail}</p>

        <div class="flex justify-center mb-8">
            <button 
                class="px-4 py-2 mr-2 {selectedBilling === 'monthly' ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
                on:click={() => selectedBilling = 'monthly'}
            >
                Monthly
            </button>
        </div>

        <div class="flex flex-wrap justify-center gap-8">
            {#each Object.entries(plans) as [key, plan]}
                <div class="bg-white p-6 rounded-lg shadow-md w-64">
                    <h2 class="text-xl font-semibold mb-4">{plan.name}</h2>
                    <p class="text-3xl font-bold mb-4">
                        ${plan[selectedBilling].price.toFixed(2)}
                        <span class="text-sm font-normal">/month</span>
                    </p>
                    <button 
                        class="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        on:click={() => handleSubscribe(plan)}
                    >
                        Subscribe
                    </button>
                </div>
            {/each}
        </div>

        <div class="text-center mt-8">
            <p class="mb-4">You have selected the <strong>{plans[selectedPlan].name}</strong> plan, billed <strong>{selectedBilling}</strong>.</p>
            <p class="text-xl">Total: <strong>${currentPrice.toFixed(2)}</strong>/month</p>
        </div>

        {#if errorMessage}
            <div class="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Error:</h2>
                <p>{errorMessage}</p>
                {#if rawServerResponse}
                    <h3 class="text-lg font-semibold mt-4 mb-2">Raw Server Response:</h3>
                    <pre class="bg-white p-2 rounded overflow-x-auto">{rawServerResponse}</pre>
                {/if}
            </div>
        {/if}
    </div>
</section>

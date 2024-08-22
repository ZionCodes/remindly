<script>
    import { onMount } from 'svelte';
    import { DateTime } from 'luxon';
    export let showModal = false;
    export let reminder = {}; 

    let dialog;

    let name = '';
    let date = '';
    let description = '';
    const maxLength = 120;
    let remainingChars = maxLength;

    let isInitialized = false;

    function formatDate(dateString) {
        const date = new Date(dateString);
        
        // Get month, day, and year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
        // Return formatted date string
        return `${year}-${month}-${day}`;
    }

// Example usage
const originalDate = "2024-08-20 00:00:00.000Z";
const formattedDate = formatDate(originalDate);
console.log(formattedDate); // Output: 08/20/2024

    $: {
        if (reminder && !isInitialized) {
            name = reminder.name || '';
            date = reminder.date ? formatDate(reminder.date) : '';
            description = reminder.description || '';
            remainingChars = maxLength - description.length;
            isInitialized = true;
        }
    }

    

    const handleInput = (event) => {
        description = event.target.value;
        remainingChars = maxLength - description.length;
    };

    let minDate = '';
    let offset = getUserTimeOffset();

    function getUserTimeOffset() {
        const offsetInMinutes = DateTime.local().offset; 
        console.log(offsetInMinutes)// Offset in minutes
        return offsetInMinutes / 60; // Convert to hours
    }

    onMount(() => {
        const today = DateTime.local();
        const tomorrow = today.plus({ days: 1 });
        minDate = tomorrow.toISODate();  // Format as 'YYYY-MM-DD'
        isInitialized = false; // Reset for next time the modal opens
    });

    $: if (dialog && showModal) dialog.showModal();

</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
    class="w-full max-w-2xl p-4 rounded-lg shadow bg-white open:animate-zoom"
>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:click|stopPropagation class="relative">
        <!-- Modal header -->
        <div class="flex justify-between items-center pb-4 mb-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">
                Add Product
            </h3>
            <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" on:click={() => dialog.close()}>
                <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                <span class="sr-only">Close modal</span>
            </button>
        </div>
        <!-- Modal body -->
        <form action="?/update" method="POST">
            <div class="grid gap-4 mb-4 sm:grid-cols-2">
                <div>
                    <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Name</label>
                    <input type="text" name="name" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Type product name" required bind:value={name}>
                </div>
                <div>
                    <label for="date" class="block mb-2 text-sm font-medium text-gray-900">Date</label>
                    <input name="date" type="date" bind:value={date} min={minDate} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" placeholder="Select date" required>
                </div>
                <div class="sm:col-span-2">
                    <label for="description" class="block mb-2 text-sm font-medium text-gray-900">Description</label>
                    <p class="text-sm text-gray-600 dark:text-gray-400">{remainingChars} characters remaining</p>
                    <textarea name="description" bind:value={description} rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500" placeholder="Write product description here" on:input={handleInput} maxlength="{maxLength}"></textarea>                    
                </div>
                <input type="hidden" name="offset" value={offset}>
                <input type="hidden" name="id" value={reminder.id}>
            </div>
            <button type="submit" class="text-white inline-flex items-center bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                <svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                Update Reminder
            </button>
        </form>
    </div>
</dialog>

<style>
    @keyframes zoom {
        from { transform: scale(0.95); }
        to { transform: scale(1); }
    }
    :global(.animate-zoom) {
        animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    :global(.animate-fade) {
        animation: fade 0.2s ease-out;
    }
    @keyframes fade {
        from { opacity: 0; }
        to { opacity: 1; }
    }
</style>
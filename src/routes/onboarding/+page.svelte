<script>
    import AdvancedTelInput from "$lib/AdvancedTelInput.svelte";


    let firstName = '';
  let errorMessage = '';

  function validateFirstName() {
    const regex = /^[^\s]+$/;
    if (!regex.test(firstName)) {
      errorMessage = 'Please enter only your first name without any spaces.';
    } else {
      errorMessage = '';
    }
  }
</script>

<section class="bg-gray-50">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="/" class="flex items-center mb-6 text-2xl font-semibold text-gray-900">
            <img class="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo">
            Flowbite    
        </a>
        <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 border">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                    Create an account
                </h1>
                <form class="space-y-4 md:space-y-6" action="#">
                    <div>
                        <label for="firstName" class="block mb-2 text-sm font-medium text-gray-900">First Name</label>
                        <input bind:value={firstName}
                        on:input={validateFirstName} type="text" name="firstName" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" required="">
                        {#if errorMessage}
                        <p class="mt-2 text-sm text-red-600 dark:text-red-500">{errorMessage}</p>
                        {/if}
                    </div>
                    <div>
                        <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900">Phone Number</label>
                        <AdvancedTelInput />
                    </div>
                    <button type="submit" class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Submit</button>
                </form>
            </div>
        </div>
    </div>
  </section>

  
  
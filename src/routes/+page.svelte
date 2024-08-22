<script>
    import { page } from '$app/stores';
</script>

<h1>Welcome to SvelteKit</h1>

{#if $page.data.user}
    <p>Welcome, {$page.data.user.name}!</p>
    <form action="/logout" method="POST">
        <button type="submit" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Logout
        </button>
    </form>
{:else}
    <p>You are not logged in.</p>
    <a href="/login" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block">
        Go to Login
    </a>
{/if}

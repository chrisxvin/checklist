<script lang="ts">
import type { PageProps } from "./$types";

let { data }: PageProps = $props();
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<section class="m-8">
    {#if data.logined}
        <h1>Checklist</h1>
    {:else}
        <a class="link link-primary" href="/auth/login">Login</a>
    {/if}
</section>

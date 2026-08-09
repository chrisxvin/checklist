<script lang="ts">
import type { LayoutProps } from "./$types";

let { logined, user }: LayoutProps["data"] = $props();
</script>

<header class="flex items-center justify-between p-2">
    {#if logined && user}
        <a href="/home">
            <strong class="text-2xl">Preflight</strong>
        </a>
    {:else}
        <strong class="text-2xl">Preflight</strong>
    {/if}
    <span>&nbsp;</span>

    <nav>
        {#if logined && user}
            <div class="avatar">
                <div class="mask mask-squircle w-12">
                    <img src={user.picture} alt="Avatar" />
                </div>
            </div>
        {:else}
            <a class="link link-primary" href="/auth/login">Login</a>
        {/if}

        <ul class="links"></ul>
    </nav>
</header>

<script lang="ts">
import type { LayoutProps } from "./$types";

let { logined, user }: LayoutProps["data"] = $props();
</script>

<header class="flex items-center justify-between p-2">
    <strong class="text-2xl">Preflight</strong>
    <span>&nbsp;</span>

    <nav>
        {#if logined && user}
            <div class="avatar">
                <div class="w-12 mask mask-squircle">
                    <img src={user.picture} alt="Avatar" />
                </div>
            </div>
        {:else}
            <a class="link link-primary" href="/auth/login">Login</a>
        {/if}

        <ul class="links"></ul>
    </nav>
</header>

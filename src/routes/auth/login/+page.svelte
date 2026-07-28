<script lang="ts">
import type { PageProps } from "./$types";

import { enhance } from "$app/forms";
import { page } from "$app/state";
import { sha256 } from "$lib/utils";

let { data, form }: PageProps = $props();

let username = $state("");
let password = $state("");
let passhash = $state("");
let notice = $derived(page.url.searchParams.get("notice"));
let error = $derived(page.url.searchParams.get("error"));

$effect(() => {
    sha256(password).then(hash => {
        passhash = hash;
    });
});
</script>

<div class="w-2/3 self-center">
    {#if data.session && data.account}
        <h1>Welcome back, {data.account.displayName}</h1>
    {:else}
        <h1>Login</h1>
        <form method="POST" use:enhance>
            <label class="input input-primary mb-2">
                <Icon icon="mdi:account" />
                <input type="text" name="username" required placeholder="Username" pattern="[A-Za-z][A-Za-z0-9\-]*" minlength="3" maxlength="30" bind:value={username} />
            </label>

            <label class="input input-primary mb-2">
                <Icon icon="mdi:lock" />
                <input type="password" required placeholder="Password" bind:value={password} />
            </label>

            <button type="submit" class="btn btn-primary mb-2">Login</button>

            <p>&nbsp;</p>
            <div class="form-group">
                <p>Don't have an account? <a class="link" href="/register">Register</a></p>
            </div>
            <div class="form-group">
                <p>Forgot your password? <a class="link" href="/reset">Reset</a></p>
            </div>

            <input type="hidden" name="passhash" value={passhash} />
        </form>

        <div class="form-group">
            <p>&nbsp;</p>
            <p>Or login with:</p>
            <a href="/auth/login/google" class="btn">Google</a>
            <!-- <button class="btn btn-secondary">GitHub</button> -->
        </div>

        <p>&nbsp;</p>
        <p>&nbsp;</p>
        {#if form?.success}
            <p>Successfully logged in! Welcome back.</p>
        {:else if form?.success === false}
            <p class="text-danger">{form?.message}</p>
        {:else if notice === "activation_required"}
            <p class="text-warning">注册已完成，等待管理员激活后才能登录。</p>
        {:else if error === "account_inactive"}
            <p class="text-warning">账号尚未激活，请联系管理员。</p>
        {/if}
    {/if}
</div>

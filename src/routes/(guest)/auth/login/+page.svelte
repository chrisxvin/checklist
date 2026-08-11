<script lang="ts">
import type { PageProps } from "./$types";

import { page } from "$app/state";
import { sha256 } from "$lib/utils";

let { form }: PageProps = $props();

let notice = $derived(page.url.searchParams.get("notice"));
let error = $derived(page.url.searchParams.get("error"));

let username = $state("");
let password = $state("");
let submitting = $state(false);
let passhashEl: HTMLInputElement;
let formEl: HTMLFormElement;

async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!username.trim() || !password) return;
    submitting = true;
    // 在客户端计算 SHA-256，服务端只保存/比较哈希，不接触明文密码
    const hash = await sha256(password);
    passhashEl.value = hash;
    formEl.submit();
}
</script>

<svelte:head>
    <title>登录 - Preflight</title>
</svelte:head>

<div class="mx-auto w-full max-w-md py-10">
    <div class="card bg-base-100 shadow-md">
        <div class="card-body gap-6 p-8">
            <div class="flex flex-col items-center gap-3 text-center">
                <span class="text-primary"><Icon icon="mdi:clipboard-check-outline" width="3rem" height="3rem" /></span>
                <h1 class="text-2xl font-bold">登录 Preflight</h1>
                <p class="text-sm text-base-content/60">你的模板和执行记录都只属于你。</p>
            </div>

            <form bind:this={formEl} method="post" onsubmit={handleSubmit}>
                <div class="flex flex-col gap-3">
                    <label class="input input-primary">
                        <Icon icon="mdi:account-outline" width="1.1em" height="1.1em" />
                        <input
                            type="text"
                            name="username"
                            placeholder="用户名"
                            autocomplete="username"
                            minlength="3"
                            maxlength="30"
                            pattern="[A-Za-z][A-Za-z0-9\-_]*"
                            required
                            bind:value={username} />
                    </label>

                    <label class="input input-primary">
                        <Icon icon="mdi:lock-outline" width="1.1em" height="1.1em" />
                        <input
                            type="password"
                            placeholder="密码"
                            autocomplete="current-password"
                            required
                            bind:value={password} />
                    </label>

                    <input bind:this={passhashEl} type="hidden" name="passhash" />

                    <button class="btn btn-primary" type="submit" disabled={submitting || !username.trim() || !password}>
                        <Icon icon="mdi:login" width="1.1em" height="1.1em" />
                        {submitting ? "登录中…" : "登录"}
                    </button>
                </div>
            </form>

            <div class="divider text-xs text-base-content/40">或使用 Google 登录</div>

            <a href="/auth/login/google" class="btn btn-primary btn-soft btn-lg">
                <Icon icon="mdi:google" width="1.2em" height="1.2em" />
                使用 Google 登录
            </a>

            {#if form?.success === false}
                <p class="text-center text-sm font-medium text-error">
                    <Icon icon="mdi:alert-circle-outline" width="1em" height="1em" />
                    {form.message}
                </p>
            {:else if notice === "activation_required"}
                <p class="text-center text-sm text-warning">注册已完成，等待管理员激活后才能登录。</p>
            {:else if error === "account_inactive"}
                <p class="text-center text-sm text-warning">账号尚未激活，请联系管理员。</p>
            {/if}
        </div>
    </div>
</div>

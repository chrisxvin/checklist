<script lang="ts">
import type { LayoutProps } from "./$types";

let { logined, user }: LayoutProps["data"] = $props();
</script>

<header class="navbar sticky top-0 z-20 bg-base-100/90 shadow-sm backdrop-blur">
    <div class="navbar-start">
        <a href={logined ? "/list" : "/"} class="btn btn-ghost px-2 text-xl font-bold">
            <span class="text-primary"><Icon icon="mdi:clipboard-check-outline" width="1.4em" height="1.4em" /></span>
            Preflight
        </a>
    </div>

    <div class="navbar-center hidden gap-1 md:flex">
        {#if logined && user}
            <a href="/list" class="btn btn-ghost btn-sm">模板库</a>
            <a href="/run" class="btn btn-ghost btn-sm">全部执行</a>
        {/if}
    </div>

    <div class="navbar-end">
        {#if logined && user}
            <div class="dropdown dropdown-end">
                <div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
                    <div class="w-9 rounded-full">
                        <img src={user.picture} alt={user.displayName} />
                    </div>
                </div>
                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                <ul tabindex="0" class="menu dropdown-content z-10 mt-2 w-52 rounded-box bg-base-100 p-2 shadow-lg">
                    <li class="menu-title">
                        {user.displayName}
                        <span class="text-xs font-normal text-base-content/50">@{user.username}</span>
                    </li>
                    <li><a href="/list"><Icon icon="mdi:view-grid-outline" width="1em" height="1em" />模板库</a></li>
                    <li><a href="/run"><Icon icon="mdi:history" width="1em" height="1em" />全部执行</a></li>
                    <li><a href="/auth/logout"><Icon icon="mdi:logout" width="1em" height="1em" />退出登录</a></li>
                </ul>
            </div>
        {:else}
            <a href="/auth/login" class="btn btn-primary btn-sm">
                <Icon icon="mdi:google" width="1em" height="1em" />
                登录
            </a>
        {/if}
    </div>
</header>

<nav class="flex gap-2 border-b border-base-300/50 bg-base-100/60 px-4 py-2 md:hidden">
    {#if logined && user}
        <a href="/list" class="btn btn-ghost btn-xs flex-1">模板库</a>
        <a href="/run" class="btn btn-ghost btn-xs flex-1">全部执行</a>
    {/if}
</nav>

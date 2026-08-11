<script lang="ts">
import type { PageProps } from "./$types";

import { EXECUTION_MODE_MAP } from "$types/enum-defs";
import { formatDateTime } from "$lib/utils/checklist";

let { data }: PageProps = $props();

let { checklists, categories, filters } = $derived(data);
// svelte-ignore state_referenced_locally
let q = $state(filters.q ?? "");
// svelte-ignore state_referenced_locally
let category = $state(filters.category ?? "");
// svelte-ignore state_referenced_locally
let includeArchived = $state(filters.includeArchived);

function submit() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (includeArchived) params.set("archived", "1");
    const query = params.toString();
    location.href = "/list" + (query ? `?${query}` : "");
}
</script>

<svelte:head>
    <title>模板库 - Preflight</title>
</svelte:head>

<div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold">模板库</h1>
        <a href="/list/new" class="btn btn-primary">
            <Icon icon="mdi:plus" width="1.1em" height="1.1em" />
            新建模板
        </a>
    </div>

    <form
        class="card bg-base-100 shadow-sm"
        onsubmit={(e) => {
            e.preventDefault();
            submit();
        }}>
        <div class="card-body flex-row flex-wrap items-center gap-3 p-4">
            <label class="input input-sm flex-1 basis-56">
                <Icon icon="mdi:magnify" width="1.1em" height="1.1em" />
                <input
                    type="search"
                    placeholder="搜索模板名称或描述…"
                    bind:value={q}
                    onkeydown={(e) => {
                        if (e.key === "Enter") submit();
                    }} />
            </label>

            <select class="select select-sm" bind:value={category} onchange={submit}>
                <option value="">全部分类</option>
                {#each categories as c}
                    <option value={c}>{c}</option>
                {/each}
            </select>

            <label class="flex cursor-pointer items-center gap-1.5 text-sm text-base-content/70">
                <input type="checkbox" class="checkbox checkbox-sm" bind:checked={includeArchived} onchange={submit} />
                显示已归档
            </label>
        </div>
    </form>

    {#if checklists.length === 0}
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body items-center gap-3 py-16 text-center">
                <span class="text-base-content/30"><Icon icon="mdi:clipboard-text-outline" width="3rem" height="3rem" /></span>
                <p class="text-base-content/60">还没有找到匹配的模板</p>
                <a href="/list/new" class="btn btn-primary btn-sm">创建第一个模板</a>
            </div>
        </div>
    {:else}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {#each checklists as list}
                <a href="/list/{list.slug}" class="card card-border bg-base-100 shadow-sm transition-shadow hover:shadow-md">
                    <div class="card-body gap-3">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex min-w-0 items-center gap-3">
                                {#if list.icon}
                                    <span class="text-primary"><Icon icon={list.icon} width="1.8em" height="1.8em" /></span>
                                {:else}
                                    <span class="text-base-content/30"><Icon icon="mdi:clipboard-text-outline" width="1.8em" height="1.8em" /></span>
                                {/if}
                                <h2 class="truncate text-lg font-semibold">{list.name}</h2>
                            </div>
                            {#if list.drafting}
                                <span class="badge badge-accent badge-soft badge-sm shrink-0">草稿</span>
                            {/if}
                        </div>

                        {#if list.description}
                            <p class="line-clamp-2 text-sm text-base-content/60">{list.description}</p>
                        {/if}

                        <div class="flex flex-wrap items-center gap-1.5">
                            {#if list.category}
                                <span class="badge badge-warning badge-soft badge-sm">{list.category}</span>
                            {/if}
                            <span class="badge badge-primary badge-soft badge-sm">v{list.version}</span>
                            <span class="badge badge-neutral badge-soft badge-sm">
                                {EXECUTION_MODE_MAP[list.executionMode]}
                            </span>
                            {#if list.archivedAt}
                                <span class="badge badge-neutral badge-sm">已归档</span>
                            {/if}
                        </div>

                        <div class="mt-1 flex items-center justify-between text-xs text-base-content/50">
                            <span>{list.steps.length} 个步骤</span>
                            <span>更新于 {formatDateTime(list.updatedAt)}</span>
                        </div>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>

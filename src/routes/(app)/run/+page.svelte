<script lang="ts">
import type { PageProps } from "./$types";

import { RUN_STATUS_MAP } from "$types/enum-defs";
import { formatDateTime, formatDuration, summarizeSteps } from "$lib/utils/checklist";

let { data }: PageProps = $props();
let { runs, checklists, filters } = $derived(data);

// svelte-ignore state_referenced_locally
let checklist = $state(filters.checklist);
// svelte-ignore state_referenced_locally
let status = $state(filters.status);
// svelte-ignore state_referenced_locally
let from = $state(filters.from);
// svelte-ignore state_referenced_locally
let to = $state(filters.to);
// svelte-ignore state_referenced_locally
let q = $state(filters.q);

function submit() {
    const params = new URLSearchParams();
    if (checklist) params.set("checklist", checklist);
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (q.trim()) params.set("q", q.trim());
    const query = params.toString();
    location.href = "/run" + (query ? `?${query}` : "");
}

function statusClass(s: RUN_STATUS) {
    switch (s) {
        case 1:
            return "badge-info";
        case 2:
            return "badge-success";
        case 3:
            return "badge-neutral";
        default:
            return "badge-ghost";
    }
}

function summary(r: IRunInstance) {
    const s = summarizeSteps(r.steps);
    return `成功 ${s.success} · 失败 ${s.failure} · 跳过 ${s.skipped} · 未处理 ${s.unresolved}`;
}
</script>

<svelte:head>
    <title>全部执行 - Preflight</title>
</svelte:head>

<div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold">全部执行</h1>
        <a href="/list/new" class="btn btn-primary btn-sm">
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
            <label class="input input-sm flex-1 basis-44">
                <Icon icon="mdi:magnify" width="1.1em" height="1.1em" />
                <input type="search" placeholder="搜索模板名或备注…" bind:value={q} />
            </label>
            <select class="select select-sm" bind:value={checklist}>
                <option value="">全部模板</option>
                {#each checklists as c}
                    <option value={c.listId}>{c.name}</option>
                {/each}
            </select>
            <select class="select select-sm" bind:value={status}>
                <option value="">全部状态</option>
                {#each Object.entries(RUN_STATUS_MAP) as [key, label]}
                    <option value={key}>{label}</option>
                {/each}
            </select>
            <input type="date" class="input input-sm" aria-label="开始日期" bind:value={from} />
            <span class="text-base-content/50">至</span>
            <input type="date" class="input input-sm" aria-label="结束日期" bind:value={to} />
            <button class="btn btn-primary btn-sm" type="submit">筛选</button>
        </div>
    </form>

    {#if runs.length === 0}
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body items-center gap-3 py-16 text-center">
                <span class="text-base-content/30"><Icon icon="mdi:history" width="3rem" height="3rem" /></span>
                <p class="text-base-content/60">还没有执行记录，去模板库开始一次执行吧</p>
                <a href="/list" class="btn btn-primary btn-sm">前往模板库</a>
            </div>
        </div>
    {:else}
        <div class="flex flex-col gap-3">
            {#each runs as r}
                <a href="/run/{r.id}" class="card card-border bg-base-100 shadow-sm transition-shadow hover:shadow-md">
                    <div class="card-body flex-row flex-wrap items-center gap-x-4 gap-y-2 p-4">
                        <div class="flex min-w-0 flex-1 items-center gap-3">
                            {#if r.icon}
                                <span class="text-primary"><Icon icon={r.icon} width="1.6em" height="1.6em" /></span>
                            {:else}
                                <span class="text-base-content/30"><Icon icon="mdi:clipboard-text-outline" width="1.6em" height="1.6em" /></span>
                            {/if}
                            <div class="min-w-0">
                                <p class="truncate font-medium">{r.name}</p>
                                <p class="text-xs text-base-content/50">
                                    {formatDateTime(r.startedAt)} · v{r.listVersion}
                                </p>
                            </div>
                        </div>

                        <span class="badge badge-soft {statusClass(r.status)}">{RUN_STATUS_MAP[r.status]}</span>

                        <div class="text-sm text-base-content/70">
                            <span class="whitespace-nowrap">{summary(r)}</span>
                            <span class="mx-2 text-base-content/30">|</span>
                            <span class="whitespace-nowrap">耗时 {formatDuration(r.durationMs)}</span>
                        </div>

                        <span class="text-base-content/30"><Icon icon="mdi:chevron-right" width="1.2em" height="1.2em" /></span>
                    </div>
                </a>
            {/each}
        </div>
    {/if}
</div>

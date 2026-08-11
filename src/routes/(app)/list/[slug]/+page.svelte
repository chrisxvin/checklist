<script lang="ts">
import type { PageProps } from "./$types";

import StepList from "$lib/components/step-list.svelte";
import { archiveList, finalizeList, unarchiveList } from "$lib/remotes/proc.checklist.remote";
import { startRun } from "$lib/remotes/proc.run.remote";
import { EXECUTION_MODE_MAP, RUN_STATUS_MAP } from "$types/enum-defs";
import { formatDateTime, formatDuration, summarizeSteps } from "$lib/utils/checklist";

let { data }: PageProps = $props();
let { list, recentRuns } = $derived(data);

let busy = $state(false);
let confirmArchive = $state(false);
let notice = $state("");

async function doFinalize() {
    busy = true;
    try {
        await finalizeList(list.listId);
        location.reload();
    } catch (e) {
        notice = e instanceof Error ? e.message : "操作失败";
        busy = false;
    }
}

async function doArchive() {
    busy = true;
    try {
        await archiveList(list.listId);
        location.reload();
    } catch (e) {
        notice = e instanceof Error ? e.message : "操作失败";
        busy = false;
    }
}

async function doUnarchive() {
    busy = true;
    try {
        await unarchiveList(list.listId);
        location.reload();
    } catch (e) {
        notice = e instanceof Error ? e.message : "操作失败";
        busy = false;
    }
}

// 状态徽章样式
function statusClass(status: RUN_STATUS) {
    switch (status) {
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

function summaryText(r: IRunInstance) {
    const s = summarizeSteps(r.steps);
    if (s.unresolved > 0) return `未处理 ${s.unresolved}`;
    return `✓${s.success} ✗${s.failure} 跳过${s.skipped}`;
}
</script>

<svelte:head>
    <title>{list.name} - Preflight</title>
</svelte:head>

<div class="flex flex-col gap-6">
    <!-- 顶部信息 -->
    <section class="card bg-base-100 shadow-sm">
        <div class="card-body gap-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-4">
                    {#if list.icon}
                        <span class="text-primary"><Icon icon={list.icon} width="2.5em" height="2.5em" /></span>
                    {:else}
                        <span class="text-base-content/30"><Icon icon="mdi:clipboard-text-outline" width="2.5em" height="2.5em" /></span>
                    {/if}
                    <div class="min-w-0">
                        <h1 class="text-2xl font-bold">{list.name}</h1>
                        {#if list.description}
                            <p class="mt-0.5 whitespace-pre-line text-sm text-base-content/60">{list.description}</p>
                        {/if}
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-1.5">
                    {#if list.category}
                        <span class="badge badge-warning badge-soft">{list.category}</span>
                    {/if}
                    <span class="badge badge-primary badge-soft">v{list.version}</span>
                    <span class="badge badge-neutral badge-soft">{EXECUTION_MODE_MAP[list.executionMode]}</span>
                    {#if list.drafting}
                        <span class="badge badge-accent badge-soft">草稿</span>
                    {:else}
                        <span class="badge badge-success badge-soft">已定稿</span>
                    {/if}
                    {#if list.archivedAt}
                        <span class="badge badge-neutral">已归档</span>
                    {/if}
                </div>
            </div>

            {#if notice}
                <div class="alert alert-error alert-soft py-2 text-sm">
                    <Icon icon="mdi:alert-circle-outline" width="1.1em" height="1.1em" />
                    {notice}
                </div>
            {/if}

            <div class="divider my-0"></div>

            <div class="flex flex-wrap items-center gap-2">
                {#if list.drafting}
                    <button class="btn btn-primary" onclick={doFinalize} disabled={busy}>
                        <Icon icon="mdi:check-decagram-outline" width="1.1em" height="1.1em" />
                        定稿
                    </button>
                    <p class="text-xs text-base-content/50">定稿后版本 v{list.version} 将被固化，之后才能开始执行。</p>
                {:else if list.archivedAt}
                    <button class="btn btn-primary btn-soft" onclick={doUnarchive} disabled={busy}>
                        <Icon icon="mdi:archive-arrow-up-outline" width="1.1em" height="1.1em" />
                        取消归档
                    </button>
                {:else}
                    <form {...startRun}>
                        <input type="hidden" name="listId" value={list.listId} />
                        <button class="btn btn-primary" type="submit">
                            <Icon icon="mdi:play" width="1.1em" height="1.1em" />
                            开始执行
                        </button>
                    </form>
                {/if}

                <a href="/list/{list.slug}/edit" class="btn btn-primary btn-soft">
                    <Icon icon="mdi:pencil-outline" width="1.1em" height="1.1em" />
                    编辑
                </a>

                <a href="/list/{list.slug}/history" class="btn btn-ghost">
                    <Icon icon="mdi:history" width="1.1em" height="1.1em" />
                    执行历史
                </a>

                {#if list.archivedAt == null}
                    {#if confirmArchive}
                        <span class="flex items-center gap-2">
                            <span class="text-sm text-error">确认归档该模板？执行历史会保留。</span>
                            <button class="btn btn-error btn-sm" onclick={doArchive} disabled={busy}>确认归档</button>
                            <button class="btn btn-ghost btn-sm" onclick={() => (confirmArchive = false)}>取消</button>
                        </span>
                    {:else}
                        <button class="btn btn-ghost btn-sm text-base-content/50" onclick={() => (confirmArchive = true)}>
                            <Icon icon="mdi:archive-outline" width="1.1em" height="1.1em" />
                            归档
                        </button>
                    {/if}
                {/if}
            </div>
        </div>
    </section>

    <!-- 步骤预览 -->
    <section class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
            <h2 class="card-title text-base">
                <Icon icon="mdi:format-list-checks" width="1.2em" height="1.2em" />
                步骤（v{list.version}，共 {list.steps.length} 步）
            </h2>
            <StepList steps={list.steps} showIndex={true} />
        </div>
    </section>

    <!-- 最近执行 -->
    <section class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
            <h2 class="card-title text-base">
                <Icon icon="mdi:history" width="1.2em" height="1.2em" />
                最近执行
            </h2>

            {#if recentRuns.length === 0}
                <p class="text-sm text-base-content/50">还没有执行记录。</p>
            {:else}
                <div class="overflow-x-auto">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>开始时间</th>
                                <th>状态</th>
                                <th>耗时</th>
                                <th>结果</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each recentRuns as r}
                                <tr class="hover">
                                    <td class="whitespace-nowrap">{formatDateTime(r.startedAt)}</td>
                                    <td><span class="badge badge-soft {statusClass(r.status)}">{RUN_STATUS_MAP[r.status]}</span></td>
                                    <td class="whitespace-nowrap">{formatDuration(r.durationMs)}</td>
                                    <td class="whitespace-nowrap">{summaryText(r)}</td>
                                    <td class="text-right">
                                        <a href="/run/{r.id}" class="btn btn-ghost btn-xs">查看</a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    </section>
</div>

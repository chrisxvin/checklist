<script lang="ts">
import type { PageProps } from "./$types";

import StepList from "$lib/components/step-list.svelte";
import {
    cancelRun,
    completeRun,
    resetStep as resetStepCmd,
    updateNote as updateNoteCmd,
    updateStep as updateStepCmd,
} from "$lib/remotes/proc.run.remote";
import { EXECUTION_MODE, EXECUTION_MODE_MAP, RUN_STATUS, RUN_STATUS_MAP } from "$types/enum-defs";
import { formatDateTime, formatDuration, summarizeSteps } from "$lib/utils/checklist";

let { data }: PageProps = $props();

// ---------------------------------------------------------------------------
// 状态
// ---------------------------------------------------------------------------
// svelte-ignore state_referenced_locally
let runRow = $state<IRunInstance>(structuredClone(data.run));
let steps: IRunStep[] = $state(runRow.steps);
// svelte-ignore state_referenced_locally
let note = $state(runRow.note ?? "");
let busy = $state<Record<string, boolean>>({});
let errorMsg = $state("");
let noteSaved = $state(false);
let confirmCancel = $state(false);
let skipOpen = $state<Record<number, boolean>>({});
let skipDraft = $state<Record<number, string>>({});
let stepEls = $state<Record<number, HTMLElement>>({});

let inProgress = $derived(runRow.status === RUN_STATUS.InProgress);
let mode = $derived(runRow.executionMode ?? EXECUTION_MODE.Free);
let isOrderedMode = $derived(mode !== EXECUTION_MODE.Free);
let summary = $derived(summarizeSteps(steps));

// 顺序/严格模式下“当前”要处理的步骤（第一个未处理）
let currentPosition = $derived.by(() => {
    if (!isOrderedMode) return 0;
    const idx = steps.findIndex(s => s.resolvedAt == null);
    return idx < 0 ? 0 : idx + 1;
});

// 顺序/严格模式下最近处理的一步（唯一可撤销）
let lastResolvedPosition = $derived.by(() => {
    for (let i = steps.length - 1; i >= 0; i--) {
        if (steps[i].resolvedAt != null) return i + 1;
    }
    return 0;
});

// ---------------------------------------------------------------------------
// 计时
// ---------------------------------------------------------------------------
let now = $state(Date.now());
$effect(() => {
    if (!inProgress) return;
    const t = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(t);
});
let elapsedMs = $derived(
    inProgress && runRow.startedAt ? now - new Date(runRow.startedAt).getTime() : runRow.durationMs,
);

// 顺序/严格模式：定位到当前步骤
let lastCurrent = $state(0);
$effect(() => {
    if (isOrderedMode && currentPosition !== lastCurrent) {
        lastCurrent = currentPosition;
        stepEls[currentPosition]?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
});

// ---------------------------------------------------------------------------
// 操作
// ---------------------------------------------------------------------------
function errText(e: unknown): string {
    return e instanceof Error ? e.message : "操作失败";
}

async function mark(position: number, result: "success" | "failure" | "skip") {
    busy = { ...busy, [position]: true };
    errorMsg = "";
    try {
        const updated = await updateStepCmd({ runId: runRow.id, position, result, skipReason: skipDraft[position] ?? null });
        steps = updated as IRunStep[];
        skipOpen = { ...skipOpen, [position]: false };
        skipDraft = { ...skipDraft, [position]: "" };
    } catch (e) {
        errorMsg = errText(e);
    } finally {
        busy = { ...busy, [position]: false };
    }
}

async function reset(position: number) {
    busy = { ...busy, [position]: true };
    errorMsg = "";
    try {
        const updated = await resetStepCmd({ runId: runRow.id, position });
        steps = updated as IRunStep[];
    } catch (e) {
        errorMsg = errText(e);
    } finally {
        busy = { ...busy, [position]: false };
    }
}

async function doComplete() {
    busy = { ...busy, ["complete"]: true };
    errorMsg = "";
    try {
        await completeRun({ runId: runRow.id });
        location.reload();
    } catch (e) {
        errorMsg = errText(e);
        busy = { ...busy, ["complete"]: false };
    }
}

async function doCancel() {
    busy = { ...busy, ["cancel"]: true };
    errorMsg = "";
    try {
        await cancelRun({ runId: runRow.id });
        location.reload();
    } catch (e) {
        errorMsg = errText(e);
        busy = { ...busy, ["cancel"]: false };
    }
}

let noteTimer: ReturnType<typeof setTimeout> | undefined;
async function saveNote() {
    try {
        await updateNoteCmd({ runId: runRow.id, note });
        noteSaved = true;
        clearTimeout(noteTimer);
        noteTimer = setTimeout(() => (noteSaved = false), 2000);
    } catch (e) {
        errorMsg = errText(e);
    }
}

function canAct(position: number): boolean {
    if (!inProgress) return false;
    const step = steps[position - 1];
    if (!step || step.resolvedAt != null) return false;
    if (isOrderedMode && position !== currentPosition) return false;
    return true;
}

function canReset(position: number): boolean {
    const step = steps[position - 1];
    if (!step || step.resolvedAt == null) return false;
    if (isOrderedMode && position !== lastResolvedPosition) return false;
    return true;
}

function statusBadgeClass(s: RUN_STATUS) {
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
</script>

<svelte:head>
    <title>执行记录 #{runRow.id} - Preflight</title>
</svelte:head>

<div class="flex flex-col gap-5">
    <!-- 头部信息 -->
    <section class="card bg-base-100 shadow-sm">
        <div class="card-body gap-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex min-w-0 items-center gap-3">
                    {#if runRow.icon}
                        <span class="text-primary"><Icon icon={runRow.icon} width="1.8em" height="1.8em" /></span>
                    {/if}
                    <div class="min-w-0">
                        <a href="/list/{runRow.slug}" class="link link-hover text-xl font-bold">{runRow.name}</a>
                        <p class="text-xs text-base-content/50">
                            基于模板 v{runRow.listVersion} · {EXECUTION_MODE_MAP[mode]}模式
                        </p>
                    </div>
                </div>
                <span class="badge badge-lg badge-soft {statusBadgeClass(runRow.status)}">
                    {RUN_STATUS_MAP[runRow.status]}
                </span>
            </div>

            <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-base-content/70">
                <span class="flex items-center gap-1">
                    <Icon icon="mdi:clock-start" width="1em" height="1em" />
                    开始 {formatDateTime(runRow.startedAt)}
                </span>
                {#if inProgress}
                    <span class="font-mono text-base-content">
                        <Icon icon="mdi:timer-outline" width="1em" height="1em" />
                        已进行 {formatDuration(elapsedMs)}
                    </span>
                {:else}
                    <span class="flex items-center gap-1">
                        <Icon icon="mdi:clock-end" width="1em" height="1em" />
                        结束 {formatDateTime(runRow.finishedAt)}
                    </span>
                    <span class="flex items-center gap-1">
                        <Icon icon="mdi:timer-outline" width="1em" height="1em" />
                        耗时 {formatDuration(runRow.durationMs)}
                    </span>
                {/if}
            </div>

            {#if errorMsg}
                <div class="alert alert-error alert-soft py-2 text-sm">
                    <Icon icon="mdi:alert-circle-outline" width="1.1em" height="1.1em" />
                    {errorMsg}
                </div>
            {/if}
        </div>
    </section>

    {#if inProgress}
        <!-- 进度总览 -->
        <section class="stats stats-vertical shadow-sm sm:stats-horizontal">
            <div class="stat">
                <div class="stat-title">成功</div>
                <div class="stat-value text-success text-2xl">{summary.success}</div>
            </div>
            <div class="stat">
                <div class="stat-title">失败</div>
                <div class="stat-value text-error text-2xl">{summary.failure}</div>
            </div>
            <div class="stat">
                <div class="stat-title">跳过</div>
                <div class="stat-value text-warning text-2xl">{summary.skipped}</div>
            </div>
            <div class="stat">
                <div class="stat-title">未处理</div>
                <div class="stat-value text-2xl">{summary.unresolved}</div>
            </div>
        </section>

        <!-- 步骤 -->
        <section class="flex flex-col gap-2">
            {#each steps as step, i}
                {@const position = i + 1}
                {@const state = step.resolvedAt == null ? "unresolved" : step.checked === true ? "success" : step.checked === false ? "failure" : "skipped"}
                {@const active = canAct(position)}
                {@const showSkipInput = skipOpen[position]}
                <div
                    bind:this={stepEls[position]}
                    class="card bg-base-100 shadow-sm transition-shadow"
                    class:ring-2={isOrderedMode && position === currentPosition}
                    class:ring-primary={isOrderedMode && position === currentPosition}
                    class:opacity-60={isOrderedMode && !active && state === "unresolved"}>
                    <div class="card-body gap-3 p-4">
                        <div class="flex items-start gap-3">
                            <div class="mt-0.5">
                                {#if state === "success"}
                                    <span class="text-success"><Icon icon="mdi:check-circle" width="1.4em" height="1.4em" /></span>
                                {:else if state === "failure"}
                                    <span class="text-error"><Icon icon="mdi:close-circle" width="1.4em" height="1.4em" /></span>
                                {:else if state === "skipped"}
                                    <span class="text-warning"><Icon icon="mdi:skip-next-circle-outline" width="1.4em" height="1.4em" /></span>
                                {:else}
                                    <span class="text-base-content/30"><Icon icon="mdi:circle-outline" width="1.4em" height="1.4em" /></span>
                                {/if}
                            </div>

                            <div class="min-w-0 flex-1">
                                <div class="flex flex-wrap items-center gap-2">
                                    {#if isOrderedMode && position === currentPosition}
                                        <span class="badge badge-primary badge-sm">当前步骤</span>
                                    {/if}
                                    <span class="badge badge-ghost badge-sm">{position}</span>
                                    <span class="font-medium">{step.content}</span>
                                    {#if step.isSkippable === false}
                                        <span class="badge badge-neutral badge-soft badge-sm">不可跳过</span>
                                    {/if}
                                    {#if state === "skipped" && step.skipReason}
                                        <span class="badge badge-warning badge-soft badge-sm">跳过：{step.skipReason}</span>
                                    {/if}
                                </div>
                                {#if step.description}
                                    <p class="mt-0.5 whitespace-pre-line text-sm text-base-content/60">{step.description}</p>
                                {/if}
                            </div>
                        </div>

                        {#if inProgress}
                            <div class="flex flex-wrap items-center gap-2 ps-6">
                                {#if state === "unresolved"}
                                    {#if isOrderedMode && position !== currentPosition}
                                        <span class="text-xs text-base-content/40">等待前面的步骤完成</span>
                                    {:else}
                                        <button
                                            class="btn btn-success btn-sm"
                                            onclick={() => mark(position, "success")}
                                            disabled={busy[position]}>
                                            <Icon icon="mdi:check" width="1em" height="1em" />
                                            成功
                                        </button>
                                        <button
                                            class="btn btn-error btn-soft btn-sm"
                                            onclick={() => mark(position, "failure")}
                                            disabled={busy[position]}>
                                            <Icon icon="mdi:close" width="1em" height="1em" />
                                            失败
                                        </button>
                                        {#if step.isSkippable !== false && mode !== EXECUTION_MODE.Strict}
                                            {#if showSkipInput}
                                                <input
                                                    class="input input-sm w-52"
                                                    type="text"
                                                    maxlength="255"
                                                    placeholder="跳过原因（可选）"
                                                    bind:value={skipDraft[position]}
                                                    onkeydown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            mark(position, "skip");
                                                        }
                                                        if (e.key === "Escape") skipOpen = { ...skipOpen, [position]: false };
                                                    }} />
                                                <button class="btn btn-warning btn-sm" onclick={() => mark(position, "skip")} disabled={busy[position]}>
                                                    <Icon icon="mdi:skip-next" width="1em" height="1em" />
                                                    确认跳过
                                                </button>
                                                <button class="btn btn-ghost btn-sm" onclick={() => (skipOpen = { ...skipOpen, [position]: false })}>取消</button>
                                            {:else}
                                                <button class="btn btn-warning btn-soft btn-sm" onclick={() => (skipOpen = { ...skipOpen, [position]: true })}>
                                                    <Icon icon="mdi:skip-next" width="1em" height="1em" />
                                                    跳过
                                                </button>
                                            {/if}
                                        {/if}
                                    {/if}
                                {:else if canReset(position)}
                                    <button class="btn btn-ghost btn-xs text-base-content/60" onclick={() => reset(position)} disabled={busy[position]}>
                                        <Icon icon="mdi:undo-variant" width="1em" height="1em" />
                                        撤销（恢复为未处理）
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </section>

        <!-- 底部操作 -->
        <section class="card bg-base-100 shadow-sm">
            <div class="card-body gap-3 p-4">
                <label class="form-control w-full">
                    <div class="label">
                        <span class="label-text">执行备注</span>
                        {#if noteSaved}
                            <span class="text-xs text-success">已保存</span>
                        {/if}
                    </div>
                    <textarea
                        class="textarea textarea-sm w-full resize-y"
                        rows="2"
                        maxlength="255"
                        placeholder="记录本次执行的补充信息（离开输入框自动保存）"
                        bind:value={note}
                        onblur={saveNote}></textarea>
                </label>

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-base-content/60">
                        {#if summary.unresolved > 0}
                            还有 <span class="font-semibold text-base-content">{summary.unresolved}</span> 个步骤未处理，处理完才能完成。
                        {:else}
                            所有步骤已处理，可以完成本次执行。
                        {/if}
                    </p>
                    <div class="flex items-center gap-2">
                        {#if confirmCancel}
                            <span class="text-sm text-error">确认取消？已处理的结果会保留。</span>
                            <button class="btn btn-error btn-sm" onclick={doCancel} disabled={busy["cancel"]}>确认取消</button>
                            <button class="btn btn-ghost btn-sm" onclick={() => (confirmCancel = false)}>返回</button>
                        {:else}
                            <button class="btn btn-ghost btn-sm text-base-content/60" onclick={() => (confirmCancel = true)}>
                                <Icon icon="mdi:stop-circle-outline" width="1.1em" height="1.1em" />
                                取消执行
                            </button>
                        {/if}
                        <button
                            class="btn btn-primary"
                            onclick={doComplete}
                            disabled={summary.unresolved > 0 || busy["complete"]}>
                            <Icon icon="mdi:flag-checkered" width="1.1em" height="1.1em" />
                            完成
                        </button>
                    </div>
                </div>
            </div>
        </section>
    {:else}
        <!-- 只读详情 -->
        <section class="card bg-base-100 shadow-sm">
            <div class="card-body gap-4">
                <div class="stats stats-vertical shadow-sm sm:stats-horizontal">
                    <div class="stat">
                        <div class="stat-title">成功</div>
                        <div class="stat-value text-success text-2xl">{summary.success}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">失败</div>
                        <div class="stat-value text-error text-2xl">{summary.failure}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">跳过</div>
                        <div class="stat-value text-warning text-2xl">{summary.skipped}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">未处理</div>
                        <div class="stat-value text-2xl">{summary.unresolved}</div>
                    </div>
                </div>

                {#if runRow.note}
                    <div class="rounded-lg bg-base-200/60 p-3">
                        <p class="mb-1 text-xs font-semibold text-base-content/50">执行备注</p>
                        <p class="whitespace-pre-line text-sm">{runRow.note}</p>
                    </div>
                {/if}

                <h2 class="card-title text-base">
                    <Icon icon="mdi:format-list-checks" width="1.2em" height="1.2em" />
                    步骤明细
                </h2>
                <StepList steps={steps} showState={true} />
            </div>
        </section>
    {/if}
</div>

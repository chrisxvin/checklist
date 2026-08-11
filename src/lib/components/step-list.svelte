<script lang="ts">
import { groupSteps } from "$lib/utils/checklist";

interface IProps {
    steps: (IStep | IRunStep)[];
    /** 是否渲染执行状态图标（Run 快照视图） */
    showState?: boolean;
    /** 是否展示步骤编号 */
    showIndex?: boolean;
}
let { steps, showState = false, showIndex = false }: IProps = $props();

function stateOf(step: IStep | IRunStep) {
    const s = step as IRunStep;
    if (s.resolvedAt == null) return "unresolved";
    if (s.checked === true) return "success";
    if (s.checked === false) return "failure";
    return "skipped";
}

let groups = $derived(groupSteps(steps));
</script>

<div class="flex flex-col gap-4">
    {#each groups as group (group.groupName)}
        <section>
            {#if group.groupName}
                <h4 class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-base-content/60">
                    <Icon icon="mdi:shape-outline" width="1em" height="1em" />
                    {group.groupName}
                </h4>
            {/if}
            <ul class="flex flex-col gap-1.5">
                {#each group.steps as step, i}
                    {@const state = showState ? stateOf(step) : "unresolved"}
                    <li
                        class="flex items-start gap-3 rounded-lg border border-base-300/60 bg-base-100 px-3 py-2.5"
                        class:opacity-60={state === "skipped"}>
                        {#if showState}
                            {#if state === "success"}
                                <span class="mt-0.5 text-success"><Icon icon="mdi:check-circle" width="1.3em" height="1.3em" /></span>
                            {:else if state === "failure"}
                                <span class="mt-0.5 text-error"><Icon icon="mdi:close-circle" width="1.3em" height="1.3em" /></span>
                            {:else if state === "skipped"}
                                <span class="mt-0.5 text-warning"><Icon icon="mdi:skip-next-circle-outline" width="1.3em" height="1.3em" /></span>
                            {:else}
                                <span class="mt-0.5 text-base-content/30"><Icon icon="mdi:circle-outline" width="1.3em" height="1.3em" /></span>
                            {/if}
                        {:else if showIndex}
                            <span class="badge badge-ghost badge-sm mt-0.5 shrink-0">{i + 1}</span>
                        {/if}

                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <span class="font-medium">{step.content}</span>
                                {#if showState && state === "skipped" && (step as IRunStep).skipReason}
                                    <span class="badge badge-warning badge-soft badge-sm">跳过：{(step as IRunStep).skipReason}</span>
                                {:else if (step as IStep).isSkippable === false}
                                    <span class="badge badge-neutral badge-soft badge-sm" title="该步骤不允许跳过">不可跳过</span>
                                {/if}
                            </div>
                            {#if step.description}
                                <p class="mt-0.5 whitespace-pre-line text-sm text-base-content/60">{step.description}</p>
                            {/if}
                        </div>
                    </li>
                {/each}
            </ul>
        </section>
    {/each}
</div>

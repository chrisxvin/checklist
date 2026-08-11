<script lang="ts">
import Sortable from "sortablejs";

interface IProps {
    /** 父级传入的 $state 数组，组件内直接修改 */
    steps: IStep[];
    disabled?: boolean;
}
let { steps, disabled = false }: IProps = $props();

let listEl: HTMLElement;

function addStep() {
    steps.push({ content: "", isSkippable: true });
}

function removeStep(index: number) {
    steps.splice(index, 1);
}

function move(from: number, to: number) {
    const [item] = steps.splice(from, 1);
    steps.splice(to, 0, item);
}

$effect(() => {
    if (!listEl || disabled) return;
    const sortable = new Sortable(listEl, {
        handle: ".drag-handle",
        animation: 150,
        ghostClass: "!opacity-40",
        chosenClass: "!bg-base-200",
        onEnd: evt => {
            const from = evt.oldIndex ?? -1;
            const to = evt.newIndex ?? -1;
            if (from >= 0 && to >= 0 && from !== to) move(from, to);
        },
    });
    return () => sortable.destroy();
});
</script>

<div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-base-content/70">步骤列表（可拖拽排序）</h3>
        <button
            class="btn btn-primary btn-sm"
            type="button"
            onclick={addStep}
            disabled={disabled}>
            <Icon icon="mdi:plus" width="1.1em" height="1.1em" />
            添加步骤
        </button>
    </div>

    {#if steps.length === 0}
        <div class="alert alert-soft alert-info text-sm">
            <Icon icon="mdi:information-outline" width="1.2em" height="1.2em" />
            还没有步骤，点击右上角“添加步骤”开始。
        </div>
    {/if}

    <ul bind:this={listEl} class="flex flex-col gap-2">
        {#each steps as step, i (i)}
            <li
                class="card card-border bg-base-100 shadow-xs transition-shadow hover:shadow-sm"
                class:opacity-60={disabled}>
                <div class="card-body gap-3 p-4">
                    <div class="flex items-center gap-2">
                        <span
                            class="drag-handle cursor-grab touch-none text-base-content/30 hover:text-base-content/60"
                            title="拖拽排序"
                            aria-hidden="true">
                            <Icon icon="mdi:drag-vertical" width="1.3em" height="1.3em" />
                        </span>

                        <span class="badge badge-ghost badge-sm shrink-0">{i + 1}</span>

                        <input
                            class="input input-sm flex-1"
                            type="text"
                            placeholder="步骤内容（必填）"
                            maxlength="200"
                            bind:value={step.content}
                            disabled={disabled} />

                        <button
                            class="btn btn-ghost btn-sm btn-square text-error"
                            type="button"
                            title="删除步骤"
                            onclick={() => removeStep(i)}
                            disabled={disabled}>
                            <Icon icon="mdi:trash-can-outline" width="1.1em" height="1.1em" />
                        </button>
                    </div>

                    <div class="grid grid-cols-1 gap-2 ps-7 md:grid-cols-2">
                        <input
                            class="input input-sm"
                            type="text"
                            placeholder="所属分组（可选，例如：起飞前检查）"
                            maxlength="255"
                            bind:value={step.groupName}
                            disabled={disabled} />
                        <div class="flex items-center gap-2">
                            <label class="flex cursor-pointer items-center gap-1.5 text-sm text-base-content/70">
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-sm"
                                    checked={step.isSkippable !== false}
                                    onchange={() => (step.isSkippable = !step.isSkippable)}
                                    disabled={disabled} />
                                允许跳过
                            </label>
                        </div>
                    </div>

                    <div class="ps-7">
                        <textarea
                            class="textarea textarea-sm w-full resize-y"
                            rows="1"
                            placeholder="补充说明（可选）"
                            maxlength="255"
                            bind:value={step.description}
                            disabled={disabled}></textarea>
                    </div>
                </div>
            </li>
        {/each}
    </ul>
</div>

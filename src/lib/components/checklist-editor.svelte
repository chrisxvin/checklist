<script lang="ts">
import StepEditor from "./step-editor.svelte";
import { EXECUTION_MODE_MAP } from "$types/enum-defs";

interface IProps {
    /** 远程 form 对象（createList 或 updateList） */
    form: Record<string, any>;
    initial: {
        name: string;
        description?: string;
        category?: string;
        icon?: string;
        executionMode: EXECUTION_MODE;
        steps: IStep[];
    };
    /** 需要随表单提交的隐藏字段（如编辑时的 listId/verId/slug） */
    hidden?: Record<string, string>;
    submitLabel?: string;
    /** 服务端校验返回的错误 */
    serverError?: string;
}
let { form, initial, hidden = {}, submitLabel = "保存", serverError }: IProps = $props();

// svelte-ignore state_referenced_locally
let name = $state(initial.name ?? "");
// svelte-ignore state_referenced_locally
let description = $state(initial.description ?? "");
// svelte-ignore state_referenced_locally
let category = $state(initial.category ?? "");
// svelte-ignore state_referenced_locally
let icon = $state(initial.icon ?? "");
// svelte-ignore state_referenced_locally
let executionMode = $state<EXECUTION_MODE>(initial.executionMode);
// svelte-ignore state_referenced_locally
let steps: IStep[] = $state(
    initial.steps.map(s => ({ ...s, isSkippable: s.isSkippable !== false })),
);

let clientError = $state("");

function validate(): boolean {
    if (!name.trim()) {
        clientError = "请填写模板名称";
        return false;
    }
    if (steps.length === 0) {
        clientError = "至少添加一个步骤";
        return false;
    }
    if (steps.some(s => !s.content.trim())) {
        clientError = "步骤内容不能为空";
        return false;
    }
    clientError = "";
    return true;
}

const ICON_PRESETS = [
    "mdi:airplane",
    "mdi:server",
    "mdi:shield-check-outline",
    "mdi:clipboard-check-outline",
    "mdi:car",
    "mdi:bag-suitcase-outline",
    "mdi:food-apple-outline",
    "mdi:home-outline",
    "mdi:package-variant-closed",
    "mdi:fire",
    "mdi:account-group-outline",
    "mdi:tools",
];
</script>

<form
    {...form}
    onsubmit={(e) => {
        if (!validate()) e.preventDefault();
    }}>
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div class="flex flex-col gap-6 lg:col-span-2">
            <!-- 基本信息 -->
            <section class="card bg-base-100 shadow-sm">
                <div class="card-body gap-4">
                    <h2 class="card-title text-base">基本信息</h2>

                    {#each Object.entries(hidden) as [k, v]}
                        <input type="hidden" name={k} value={v} />
                    {/each}

                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">名称 <span class="text-error">*</span></span>
                        </div>
                        <input
                            type="text"
                            name="name"
                            class="input w-full"
                            placeholder="例如：飞机起飞前检查"
                            maxlength="120"
                            required
                            bind:value={name} />
                    </label>

                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">分类</span>
                        </div>
                        <input
                            type="text"
                            name="category"
                            class="input w-full"
                            placeholder="例如：出行 / 服务器巡检"
                            maxlength="255"
                            bind:value={category} />
                    </label>

                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">图标</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-primary">
                                <Icon icon={icon || "mdi:clipboard-text-outline"} width="1.6em" height="1.6em" />
                            </span>
                            <input
                                type="text"
                                name="icon"
                                class="input w-full"
                                placeholder="Iconify 图标名，例如 mdi:airplane"
                                maxlength="255"
                                bind:value={icon} />
                        </div>
                        <div class="mt-2 flex flex-wrap gap-1.5">
                            {#each ICON_PRESETS as preset}
                                <button
                                    type="button"
                                    class="btn btn-ghost btn-sm btn-square"
                                    class:btn-primary={icon === preset}
                                    title={preset}
                                    onclick={() => (icon = preset)}>
                                    <Icon icon={preset} width="1.2em" height="1.2em" />
                                </button>
                            {/each}
                        </div>
                    </label>

                    <label class="form-control w-full">
                        <div class="label">
                            <span class="label-text">描述</span>
                        </div>
                        <textarea
                            name="description"
                            class="textarea w-full resize-y"
                            rows="3"
                            placeholder="这个检查单用来做什么？"
                            maxlength="255"
                            bind:value={description}></textarea>
                    </label>

                    <fieldset>
                        <div class="label">
                            <span class="label-text">执行模式</span>
                        </div>
                        <div class="flex flex-col gap-2">
                            {#each Object.entries(EXECUTION_MODE_MAP) as [key, label]}
                                <label
                                    class="flex cursor-pointer items-center gap-3 rounded-lg border border-base-300/60 px-3 py-2.5"
                                    class:border-primary={executionMode === Number(key)}
                                    class:bg-primary-50={executionMode === Number(key)}>
                                    <input
                                        type="radio"
                                        name="executionMode"
                                        class="radio radio-primary radio-sm"
                                        value={key}
                                        checked={executionMode === Number(key)}
                                        onchange={() => (executionMode = Number(key) as EXECUTION_MODE)} />
                                    <span class="flex flex-col">
                                        <span class="text-sm font-medium">{label}</span>
                                        <span class="text-xs text-base-content/50">
                                            {key === "0" ? "可任意顺序处理步骤" : key === "1" ? "按顺序处理，可跳过允许跳过的步骤" : "按顺序处理，不允许跳过"}
                                        </span>
                                    </span>
                                </label>
                            {/each}
                        </div>
                    </fieldset>
                </div>
            </section>
        </div>

        <div class="flex flex-col gap-6 lg:col-span-3">
            <section class="card bg-base-100 shadow-sm">
                <div class="card-body">
                    <StepEditor {steps} />
                </div>
            </section>
        </div>
    </div>

    <input type="hidden" name="steps" value={JSON.stringify(steps)} />

    <div class="sticky bottom-4 z-10 mt-6">
        <div class="card bg-base-100/95 shadow-lg backdrop-blur">
            <div class="card-body flex-row items-center justify-between gap-3 p-4">
                <div class="text-sm">
                    {#if clientError || serverError}
                        <p class="font-medium text-error">
                            <Icon icon="mdi:alert-circle-outline" width="1.1em" height="1.1em" />
                            {clientError || serverError}
                        </p>
                    {:else}
                        <p class="text-base-content/60">{steps.length} 个步骤 · 共 {steps.filter(s => s.content.trim()).length} 个已填写</p>
                    {/if}
                </div>
                <button class="btn btn-primary" type="submit">
                    <Icon icon="mdi:content-save-outline" width="1.1em" height="1.1em" />
                    {submitLabel}
                </button>
            </div>
        </div>
    </div>
</form>

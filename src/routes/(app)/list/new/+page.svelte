<script lang="ts">
import type { PageProps } from "./$types";

import ChecklistEditor from "$lib/components/checklist-editor.svelte";
import { createList } from "$lib/remotes/proc.checklist.remote";

let { form }: PageProps = $props();

type FormResult = { issues?: { message: string }[] };
let serverError = $derived(((form as FormResult | undefined)?.issues?.length) ? (form as FormResult).issues![0].message : undefined);
</script>

<svelte:head>
    <title>新建模板 - Preflight</title>
</svelte:head>

<div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">新建模板</h1>
            <p class="text-sm text-base-content/60">保存后将以草稿状态创建 v1，定稿后才能开始执行。</p>
        </div>
        <a href="/list" class="btn btn-ghost btn-sm">
            <Icon icon="mdi:arrow-left" width="1em" height="1em" />
            返回模板库
        </a>
    </div>

    <ChecklistEditor
        form={createList}
        initial={{ name: "", executionMode: 0, steps: [] }}
        submitLabel="保存模板"
        {serverError} />
</div>

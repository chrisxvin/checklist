<script lang="ts">
import type { PageProps } from "./$types";

import ChecklistEditor from "$lib/components/checklist-editor.svelte";
import { updateList } from "$lib/remotes/proc.checklist.remote";

let { data, form }: PageProps = $props();

type FormResult = { issues?: { message: string }[] };
let serverError = $derived(((form as FormResult | undefined)?.issues?.length) ? (form as FormResult).issues![0].message : undefined);
</script>

<svelte:head>
    <title>编辑模板 - Preflight</title>
</svelte:head>

<div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">编辑模板</h1>
            <p class="text-sm text-base-content/60">
                当前版本 v{data.list.version}
                {#if data.list.drafting}
                    · 草稿状态，保存不会产生新版本
                {:else}
                    · 已定稿，保存将创建新版本并进入草稿
                {/if}
            </p>
        </div>
        <a href="/list/{data.list.slug}" class="btn btn-ghost btn-sm">
            <Icon icon="mdi:arrow-left" width="1em" height="1em" />
            返回详情
        </a>
    </div>

    <ChecklistEditor
        form={updateList}
        initial={{
            name: data.list.name,
            description: data.list.description ?? "",
            category: data.list.category ?? "",
            icon: data.list.icon ?? "",
            executionMode: data.list.executionMode,
            steps: data.list.steps,
        }}
        hidden={{
            listId: data.list.listId,
            verId: data.list.verId,
            slug: data.list.slug,
        }}
        submitLabel="保存修改"
        {serverError} />
</div>

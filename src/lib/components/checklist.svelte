<script lang="ts">
import { finalizeList } from "$lib/remotes/proc.checklist.remote";

interface IProps {
    checklist: IChecklistInstance;
    inPreview?: boolean;
}
let { checklist, inPreview }: IProps = $props();

async function doFinalize() {
    await finalizeList(checklist.listId);
    window.location.reload();
}
</script>

<div class="flex flex-row gap-2">
    <!-- todo: 可以自己给分类设置颜色 -->
    <span class="badge badge-warning rounded-none">{checklist.category}</span>

    <span class="badge badge-primary rounded-none">Ver {checklist.version}</span>
</div>

<div class="flex justify-between">
    {#if inPreview}
        <a href="/list/{checklist.slug}" class="hover:link hover:link-primary" title="List">
            <h2 class="text-3xl font-bold">{checklist.name}</h2>
        </a>
    {:else}
        <h2 class="text-3xl font-bold">{checklist.name}</h2>
    {/if}
    {#if checklist.drafting}
        <span class="badge badge-sm badge-accent">草稿</span>
    {/if}
</div>
<p>{checklist.description}</p>

<ul class="mt-6 flex flex-col gap-2 text-xs">
    {#each checklist.steps as step}
        <li>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="text-primary me-2 inline-block size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                    fill="currentColor"
                    d="M12 20a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8m0-18A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" />
            </svg>
            <span>{step.content}</span>
        </li>
    {/each}
</ul>

<div class="mt-6 flex gap-4">
    {#if checklist.drafting}
        <button class="btn btn-primary" onclick={doFinalize}>Finalize 定稿</button>
    {:else}
        <button class="btn btn-primary">Run! 运行</button>
    {/if}
    <button class="btn btn-primary btn-soft">Edit 编辑</button>
</div>

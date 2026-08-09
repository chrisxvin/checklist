<script lang="ts">
interface IProps {
    checklist: IChecklistInstance;
}
let { checklist }: IProps = $props();
</script>

<div class="card bg-base-100 m-2 shadow-sm">
    <div class="card-body">
        <!-- todo: 可以自己给分类设置颜色 -->
        <span class="badge badge-xs badge-warning">{checklist.category}</span>
        <div class="flex justify-between">
            <h2 class="text-3xl font-bold">{checklist.name}</h2>
            <!-- <a href="/u/{params.accountSlug}/list/{checklist.listSlug}" class="hover:link hover:link-primary" title="List">
                <h2 class="text-3xl font-bold">{checklist.name}</h2>
            </a> -->
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
            <button class="btn btn-primary">Run!</button>
            <button class="btn btn-primary btn-soft">Edit</button>
        </div>
    </div>
</div>

<script lang="ts">
import type { PageProps } from "./$types";

import Checklist from "$lib/components/checklist.svelte";

let { data, params }: PageProps = $props();
</script>

<div>
    {#each data.checklists as checklist}
        <div class="card bg-base-100 m-2 shadow-sm">
            <div class="card-body">
                <Checklist {checklist} inPreview={true} />
            </div>
        </div>
    {/each}
</div>

<div class="fab">
    <button class="btn btn-lg btn-circle btn-primary">
        <a href="/list/new" title="Add new list">
            <svg
                aria-label="New"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </a>
    </button>
</div>

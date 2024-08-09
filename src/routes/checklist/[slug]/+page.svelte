<script lang="ts">
import type { PageData } from "./$types";

import { page } from "$app/stores";

interface IProps {
    data: PageData;
}
let { data }: IProps = $props();

const editUrl = $page.url + "/edit";
let stepIndex = $state(-1);
let completed = $derived(stepIndex === data.items.length);

function doStart() {
    data.items.forEach(_ => (_.checked = false));
    stepIndex = 0;
}

function doNext() {
    if (stepIndex > -1 && stepIndex < data.items.length) {
        data.items[stepIndex].checked = true;
        stepIndex++;
    }
}

function doDone() {
    stepIndex = -1;
}
</script>

<svelte:head>
    <title>{data.name} - Checklist</title>
</svelte:head>

<div class="flex items-center">
    <a href={editUrl}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-8">
            <title>Edit</title>
            <path
                d="M3 6V8H14V6H3M3 10V12H14V10H3M20 10.1C19.9 10.1 19.7 10.2 19.6 10.3L18.6 11.3L20.7 13.4L21.7 12.4C21.9 12.2 21.9 11.8 21.7 11.6L20.4 10.3C20.3 10.2 20.2 10.1 20 10.1M18.1 11.9L12 17.9V20H14.1L20.2 13.9L18.1 11.9M3 14V16H10V14H3Z" />
        </svg>
    </a>
    <h1 class="flex-1">{data.name}</h1>
    <span>&nbsp;</span>
</div>

<p>{data.description}</p>

<ul class="list flex-1">
    {#each data.items as item, i}
        <li class:active-step={i === stepIndex}>
            <div class="form-control">
                <label class="label cursor-pointer">
                    <input type="checkbox" checked={item.checked} class="checkbox-primary checkbox" />
                    <div class="label-text ml-4 flex w-full flex-row justify-between">
                        <span>{item.content}</span>
                        <span class="dotted-space mx-2 grow border-b-4 border-dotted border-neutral">&nbsp;</span>
                        <span>{item.shouldBe}</span>
                    </div>
                </label>
            </div>
        </li>
    {/each}

    {#if completed}
        <p>Completed!</p>
    {/if}
</ul>

<div class="sticky bottom-0 flex flex-row gap-2">
    <button class="btn btn-primary" onclick={doStart}>Start</button>
    <button class="btn btn-info flex-1" disabled={stepIndex < 0 || stepIndex >= data.items.length} onclick={doNext}>Next</button>
    <button class="btn" onclick={doDone}>Done</button>
</div>

<style>
.list li {
    @apply px-4 py-1;
}

.list .dotted-space {
    --border-color: theme(colors.neutral);
    border-color: color-mix(in oklch, var(--border-color) 50%, var(--border-color) 50%);
    height: calc(1lh - 4px);
}

.active-step {
    @apply rounded-lg bg-info-200;
}
</style>

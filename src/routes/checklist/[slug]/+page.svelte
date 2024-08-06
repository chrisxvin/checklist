<script lang="ts">
import type { PageData } from "./$types";

import { page } from "$app/stores";

interface IProps {
    data: PageData;
}
let { data }: IProps = $props();

const editUrl = $page.url + "/edit";
</script>

<svelte:head>
    <title>{data.name} - Checklist</title>
</svelte:head>

<p><a href={editUrl}>Edit</a></p>

<h1>{data.name}</h1>

<p>{data.description}</p>
<ul>
    {#each data.items as item}
        <li>
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
</ul>

<style>
.dotted-space {
    --border-color: theme(colors.neutral);
    border-color: color-mix(in oklch, var(--border-color) 50%, var(--border-color) 50%);
    height: calc(1lh - 4px);
}
</style>

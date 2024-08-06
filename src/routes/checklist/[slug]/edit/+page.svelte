<script lang="ts">
import type { PageData } from "./$types";

import { page } from "$app/stores";

interface IProps {
    data: PageData;
}
let { data }: IProps = $props();

const list = $state(data);
const newItem: ICheckItem = {
    content: "",
    checked: false,
    shouldBe: "",
    comment: "",
};

function addItem() {
    list.items.push({ ...newItem });
}

function save() {
    // saveSingleCheckList(list);
}

function close() {
    window.location.href = `/checklist/${$page.params.slug}`;
}
</script>

<input type="text" placeholder="Name" class="input input-bordered input-sm col-span-2 w-full" bind:value={list.name} />
<input type="text" placeholder="Description" class="input input-bordered input-sm w-full" bind:value={list.description} />

<div>
    <ul>
        {#each list.items as item}
            <li class="grid grid-cols-3 gap-2 border p-2 md:grid-cols-6">
                <input type="text" placeholder="New item..." class="input input-sm col-span-2 w-full" bind:value={item.content} />
                <input type="text" placeholder="Target state" class="input input-sm w-full" bind:value={item.shouldBe} />
                <input type="text" placeholder="Comment..." class="input input-sm col-span-3 w-full" bind:value={item.comment} />
            </li>
        {/each}
    </ul>
</div>

<div class="flex flex-row justify-center">
    <button class="btn btn-outline btn-primary" onclick={addItem}>Add</button>
    <button class="btn btn-outline btn-primary" onclick={save}>Save</button>
    <button class="btn btn-outline " onclick={close}>Close</button>
</div>

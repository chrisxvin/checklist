<script lang="ts">
import { loadSingleCheckList, saveSingleCheckList } from "../../data";
import { page } from "$app/stores";

const checklist = loadSingleCheckList($page.params.slug);
const items = $state(checklist.items);
const newItem: ICheckItem = {
    id: "",
    content: "",
    checked: false,
    shouldBe: "",
    comment: "",
};

function addItem() {
    items.push({ ...newItem });
}

function save() {
    saveSingleCheckList(checklist);
}

function close() {
    window.location.href = `/checklist/${$page.params.slug}`;
}
</script>

<div>
    <ul>
        {#each items as item}
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

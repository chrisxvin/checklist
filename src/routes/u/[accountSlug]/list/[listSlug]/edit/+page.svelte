<script lang="ts">
import type { PageProps } from "./$types";

let { data }: PageProps = $props();

let list: Partial<IChecklist> = $state({});
let steps: IStep[] = $state([]);

function addStep(e: Event) {
    e.preventDefault();
    steps.push({
        content: "",
    });
}
</script>

<div>
    <h1>Add new list</h1>

    <form method="post" class="flex flex-col gap-4">
        <label class="floating-label">
            <input type="text" placeholder="Name" class="input" bind:value={list.name} />
            <span>Name</span>
        </label>

        <label class="floating-label">
            <input type="text" placeholder="Category" class="input" bind:value={list.category} />
            <span>Category</span>
        </label>
        
        <label class="floating-label">
            <textarea name="description" class="textarea" placeholder="Description" bind:value={list.description}></textarea>
            <!-- <input type="text" placeholder="Description" class="input" bind:value={newList.description} /> -->
            <span>Description</span>
        </label>

        <div>
            <button class="btn btn-soft btn-primary btn-sm" type="button" onclick={addStep}>Add</button>
        </div>
        <ul class="flex flex-col gap-2">
            {#each steps as step, i}
                <li>
                    <input type="text" class="input" bind:value={step.content} />
                </li>
            {/each}
        </ul>
    </form>
</div>

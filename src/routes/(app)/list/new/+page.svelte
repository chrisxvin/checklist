<script lang="ts">
import type { PageProps } from "./$types";

import { createList } from "$lib/remotes/proc.checklist.remote";
import { EXECUTION_MODE, EXECUTION_MODE_MAP } from "$types/enum-defs";

let { data }: PageProps = $props();

let steps: IStep[] = $state([]);

function saveList() {}

function addStep(e: Event) {
    e.preventDefault();
    steps.push({
        content: "",
    });
}

function doTest(e: Event) {
    e.preventDefault();
    log(steps);
    log($state.snapshot(steps));
}
</script>

<div>
    <h1>Add new list (as draft)</h1>
    <button class="btn btn-soft btn-primary btn-sm" type="button" onclick={saveList}>Save</button>

    <form {...createList} class="flex flex-col gap-4">
        <label class="floating-label">
            <input {...createList.fields.name.as("text")} placeholder="Name" class="input" />
            <span>Name</span>
        </label>

        <label class="floating-label">
            <input {...createList.fields.category.as("text")} placeholder="Category" class="input" />
            <span>Category</span>
        </label>

        <label class="floating-label">
            <textarea {...createList.fields.description.as("text")} placeholder="Description" class="textarea"></textarea>
            <span>Description</span>
        </label>

        <span class="label">Execution mode</span>
        {#each Object.entries(EXECUTION_MODE_MAP) as [key, execMode]}
            <label class="flex flex-row">
                <input {...createList.fields.executionMode.as("radio", key)} class="radio" />
                <span class="label">{execMode}</span>
            </label>
        {/each}

        <div>
            <button class="btn btn-soft btn-primary btn-sm" type="button" onclick={addStep}>Add step</button>
        </div>
        <ul class="flex flex-col gap-2">
            {#each steps as step, i (i)}
                <li>
                    <input {...createList.fields.steps[i].content.as("text")} class="input" />
                </li>
            {/each}
        </ul>

        <input type="hidden" {...createList.fields.steps} value={steps} />

        <hr />
        <div class="flex flex-row gap-2">
            <button class="btn btn-soft btn-primary btn-sm">Save</button>
            <button class="btn btn-soft btn-primary btn-sm" type="button" onclick={doTest}>Test</button>
        </div>
    </form>
</div>

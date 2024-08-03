<script lang="ts">
import { page } from "$app/stores";
import { loadSingleCheckList, saveSingleCheckList } from "../data";

const editUrl = $page.url + "/edit";
const checklist = loadSingleCheckList($page.params.slug);
</script>

<h1>Before driving</h1>
<!-- <button class="btn btn-outline btn-primary" onclick={() => {editing=true;}}>Edit</button> -->
<a href={editUrl}>Edit</a>

<p>{checklist.title}</p>
<ul>
    {#each checklist.items as item}
        <li>
            <div class="form-control">
                <label class="label cursor-pointer">
                    <input type="checkbox" checked={item.checked} class="checkbox-primary checkbox" />
                    <div class="label-text flex flex-row justify-between w-full ml-4">
                        <span>{item.content}</span>
                        <span class="grow border-b-4 border-neutral border-dotted mx-2 dotted-space">&nbsp;</span>
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

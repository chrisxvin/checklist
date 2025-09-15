<script lang="ts">
import type { PageData } from "./$types";

interface IProps {
    data: PageData;
}
let { data }: IProps = $props();
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Just a checklist" />
</svelte:head>

<section>
    <h1>Checklist</h1>
    <ul>
        {#each data.list as list}
            <li><a href={`/checklist/${list.id}/`}>{list.name}</a></li>
        {/each}
    </ul>
</section>

<style>
section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
}

h1 {
    width: 100%;
}
</style>

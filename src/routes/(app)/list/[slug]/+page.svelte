<script lang="ts">
import type { PageProps } from "./$types";

import Checklist from "$lib/components/checklist.svelte";

let { data }: PageProps = $props();
let { list } = $derived(data);
</script>

<Checklist checklist={list} />

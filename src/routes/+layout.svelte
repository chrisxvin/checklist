<script module>
import "../app.css";
</script>

<script lang="ts">
import type { LayoutProps } from "./$types";

import Header from "./Header.svelte";

let { data, children }: LayoutProps = $props();
</script>

<div class="app mx-auto flex min-h-screen w-full flex-col self-center border border-blue-300 md:w-xl">
    <Header {...data} />

    <!-- <slot /> -->
    {@render children()}
</div>

<style lang="postcss">
@reference "tailwindcss";

</style>

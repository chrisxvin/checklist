<script module>
import "../app.css";
</script>

<script lang="ts">
import type { LayoutProps } from "./$types";

let { data, children }: LayoutProps = $props();
</script>

<div class="app mx-auto flex min-h-screen w-full flex-col self-center border border-blue-300 md:w-xl">
    <!-- <slot /> -->
    {@render children()}
</div>

<style lang="postcss">
@reference "tailwindcss";

</style>

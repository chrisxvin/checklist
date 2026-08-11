<script module>
import "../app.css";
</script>

<script lang="ts">
import type { LayoutProps } from "./$types";

import Header from "./Header.svelte";

let { data, children }: LayoutProps = $props();
</script>

<div class="flex min-h-screen flex-col bg-base-200/40">
    <Header {...data} />

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {@render children()}
    </main>

    <footer class="py-6 text-center text-xs text-base-content/40">
        Preflight · 把重复的工作固化成检查单
    </footer>
</div>

<script>
import Header from "./Header.svelte";
import Footer from "./Footer.svelte";
import "../app.css";

let { children } = $props();
</script>

<div class="app">
    <Header />

    <main class="main">
        <!-- <slot /> -->
        {@render children()}
    </main>

    <Footer />
</div>

<style>
.app {
    min-height: 100vh;
    display: grid;
    grid-template-rows: min-content 1fr min-content;
    grid-auto-flow: row;
}

.main {
    @apply mb-auto px-4;

    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    width: 100%;
    max-width: 64rem;
    margin: 0 auto;
    box-sizing: border-box;
}

</style>

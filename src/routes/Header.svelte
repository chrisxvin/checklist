<script>
import { page } from "$app/stores";
import github from "$lib/images/github.svg";
</script>

<header class="flex justify-between">
    <div class="corner">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="text-primary">
            <title>Checklist</title>
            <path d="M3,5H9V11H3V5M5,7V9H7V7H5M11,7H21V9H11V7M11,15H21V17H11V15M5,20L1.5,16.5L2.91,15.09L5,17.17L9.59,12.59L11,14L5,20Z" />
        </svg>
    </div>

    <nav>
        <svg viewBox="0 0 2 3" aria-hidden="true">
            <path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
        </svg>
        <ul class="links">
            <li aria-current={$page.url.pathname === "/" ? "page" : undefined}>
                <a href="/">Home</a>
            </li>
            <!--
            <li aria-current={$page.url.pathname === "/about" ? "page" : undefined}>
                <a href="/about">About</a>
            </li>
            <li aria-current={$page.url.pathname.startsWith("/sverdle") ? "page" : undefined}>
                <a href="/sverdle">Sverdle</a>
            </li>
            -->
        </ul>
        <svg viewBox="0 0 2 3" aria-hidden="true">
            <path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
        </svg>
    </nav>

    <div class="corner">
        <a href="https://github.com/chrisxvin/checklist">
            <img src={github} alt="GitHub" />
        </a>
    </div>
</header>

<style>
.corner {
    @apply size-12 flex justify-center;
    /* width: 3em;
    height: 3em;
    display: flex;
    justify-content: center; */
}

.corner a {
    @apply flex items-center justify-center size-full;
    /* display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%; */
}

.corner img {
    @apply size-8 object-contain;
    /* width: 2em;
    height: 2em;
    object-fit: contain; */
}

nav {
    display: flex;
    justify-content: center;
    --background: rgba(255, 255, 255, 0.7);
}

svg {
    width: 2em;
    height: 3em;
    display: block;
}

path {
    fill: var(--background);
}

.links {
    position: relative;
    padding: 0;
    margin: 0;
    height: 3em;
    display: flex;
    justify-content: center;
    align-items: center;
    list-style: none;
    background: var(--background);
    background-size: contain;
}

.links li {
    position: relative;
    height: 100%;
}

.links li[aria-current="page"]::before {
    --size: 6px;
    content: "";
    width: 0;
    height: 0;
    position: absolute;
    top: 0;
    left: calc(50% - var(--size));
    border: var(--size) solid transparent;
    border-top: var(--size) solid var(--color-theme-1);
}

nav a {
    display: flex;
    height: 100%;
    align-items: center;
    padding: 0 0.5rem;
    color: var(--color-text);
    font-weight: 700;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    text-decoration: none;
    transition: color 0.2s linear;
}

a:hover {
    color: var(--color-theme-1);
}
</style>

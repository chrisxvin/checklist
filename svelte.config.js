// import adapter from "@sveltejs/adapter-auto";
import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    compilerOptions: {
        dev: true,
        runes: true,
    },

    // Consult https://svelte.dev/docs/kit/integrations
    // for more information about preprocessors
    preprocess: vitePreprocess(),

    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter({ out: "dist" }),
        alias: {
            "$types": "./src/types",
            "$types/*": "./src/types/*",
        },
    },

    vitePlugin: {
        inspector: {
            toggleKeyCombo: "alt-x",
            showToggleButton: "always",
            toggleButtonPos: "bottom-right",
        },
    },

    onwarn: (warning, handler) => {
        if (warning.code.startsWith("a11y_")) {
            return;
        }
        handler(warning);
    },
};

export default config;

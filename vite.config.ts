/// <reference types="vitest/config" />

import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import AutoImport from "unplugin-auto-import/vite";
import Preprocessor from "unplugin-preprocessor-directives/vite";
import devtoolsJson from "vite-plugin-devtools-json";

const _DEBUG = process.env.NODE_ENV !== "production";

export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 3000,
        allowedHosts: true,
        https: {
            key: "./site.key",
            cert: "./site.crt",
        },
    },
    plugins: [
        Preprocessor(),
        devtoolsJson(),
        tailwindcss(),
        sveltekit(),
        AutoImport({
            // include: [
            //     /\.svelte$/,
            //     /\.svelte\?svelte/, // .svelte
            //     /\.md$/, // .md
            // ],
            imports: [
                "svelte",
                "svelte/store",
                "svelte/transition",
            ],
            dirs: [
                "./src/lib/components/**",
            ],
            dts: "./src/types/auto-imports.d.ts",
        }),
    ],
    build: {
        rollupOptions: {
            plugins: [
            ],
        },
    },
    test: {
        include: ["src/**/*.{test,spec}.{js,ts}"],
    },
});

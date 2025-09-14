import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";
import rollupJscc from "rollup-plugin-jscc";
import AutoImport from "unplugin-auto-import/vite";
import devtoolsJson from "vite-plugin-devtools-json";

const _DEBUG = process.env.NODE_ENV !== "production";

export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 3000,
        allowedHosts: true,
    },
    plugins: [
        devtoolsJson(),
        {
            // 条件编译插件。作为 Vite 插件仅能在开发模式下使用。生产模式仍然要回归到 Rollup 插件。
            ...rollupJscc({
                values: {
                    _DEBUG,
                },
            }),
            apply: "serve",
        },
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
                rollupJscc({
                    values: {
                        _DEBUG,
                    },
                }),
            ],
        },
    },
    test: {
        include: ["src/**/*.{test,spec}.{js,ts}"],
    },
});

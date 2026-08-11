import { defineConfig } from "@playwright/test";

const runtime = globalThis as typeof globalThis & {
    process?: {
        env?: Record<string, string | undefined>;
    };
};
const LOCAL_BASE_URL = "https://127.0.0.1:3002";
const requestedBaseURL = runtime.process?.env?.PLAYWRIGHT_BASE_URL;
const allowRemoteBaseURL = runtime.process?.env?.PLAYWRIGHT_ALLOW_REMOTE_BASE_URL === "true";
const isLocalBaseURL = requestedBaseURL ? /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(requestedBaseURL) : false;
const baseURL = requestedBaseURL && (allowRemoteBaseURL || isLocalBaseURL) ? requestedBaseURL : LOCAL_BASE_URL;
const useManagedLocalServer = baseURL === LOCAL_BASE_URL;

export default defineConfig({
    testDir: "./src/test/e2e",
    timeout: 30_000,
    fullyParallel: false,
    webServer: useManagedLocalServer
        ? {
              command: "pnpm dev --host 127.0.0.1 --port 3002 --strictPort",
              url: LOCAL_BASE_URL,
                            ignoreHTTPSErrors: true,
              reuseExistingServer: true,
              timeout: 120_000,
          }
        : undefined,
    use: {
        baseURL,
        ignoreHTTPSErrors: true,
        trace: "retain-on-failure",
    },
});

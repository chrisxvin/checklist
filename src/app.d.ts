// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            // todo: 考虑去掉 Nullable，因为 hook.server 会拦截所有未登录的请求。
            // todo: 同时检查还有哪些地方独立校验了 session，一并去掉
            session?: ISession;
            user?: Partial<IAccount>;
        }
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
}

export {};

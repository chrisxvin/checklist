import type { Handle, ServerInit } from "@sveltejs/kit";

import { redirect } from "@sveltejs/kit";
import { default as detectMobile } from "ismobilejs";
import { installGlobal } from "@cyysummer/core";
import { DEPLOY_HOST } from "$env/static/private";
import { env } from "$env/dynamic/private";
import { connect } from "$lib/server/db";
import { deleteSessionTokenCookie, setSessionTokenCookie, validateSessionToken } from "$lib/server/session";

//#if _DEBUG
import { setGlobalDispatcher, ProxyAgent } from "undici";
(env.https_proxy) && setGlobalDispatcher(new ProxyAgent(env.https_proxy));
//#endif

installGlobal();

export const init: ServerInit = () => {
    connect();
};

export const handle: Handle = async ({ event, resolve }) => {
    // 判断是否为移动设备
    // `ismobilejs` needs a hack.
    // log(typeof detectMobile, detectMobile);
    globalThis.isMobile = (detectMobile as any).default(event.request.headers.get("User-Agent") ?? "").any;

    if (event.request.method !== "GET") {
        // 阻止跨域攻击  csrf protection
        const host = event.request.headers.get("Host");
        log("server hook, Host:", host);
        // You can also compare it against the Host or X-Forwarded-Host header.
        if (host === null || (
            host !== "localhost:3000" &&
            host !== DEPLOY_HOST)
        ) {
            log.warn("Invalid Origin header:", host);
            return new Response(null, {
                status: 403,
            });
        }

        const url = new URL(event.request.url);
        if (url.pathname.startsWith("/login")) {
            // 登录请求不需要重定向到登录页
            return resolve(event);
        }
    }

    const token = event.cookies.get("session");
    // 没有 session？
    if (token == null) {
        event.locals.session = undefined;

        // 访问的是不需要登录的页面
        log(event.url);
        if (event.url.pathname == "/" ||
            event.url.pathname == "/login" ||
            event.url.pathname.startsWith("/plan/") && event.url.searchParams.get("s") != null
        ) {
            return resolve(event);
        }

        // 登录去吧！
        return redirect(302, "/login");
    }

    const { session } = await validateSessionToken(token);
    if (session != null) {
        setSessionTokenCookie(event.cookies, token, session.expiresAt);
    } else {
        deleteSessionTokenCookie(event.cookies);
    }

    event.locals.session = session;

    return resolve(event);
};

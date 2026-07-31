import type { Handle, ServerInit } from "@sveltejs/kit";

import "dotenv/config";
import "@buxton/core/global";
import "@buxton/core/polyfill";
import { redirect } from "@sveltejs/kit";
import { default as detectMobile } from "ismobilejs";
import { DEPLOY_URL } from "$env/static/private";
import { deleteSessionTokenCookie, setSessionTokenCookie, validateSessionToken } from "$lib/server/session";
import { sql } from "$lib/server/db";

export const init: ServerInit = () => {
    // connect();
};

function isShareAccessPath(pathname: string) {
    return /\/share\/[^/]+$/.test(pathname);
}

export const handle: Handle = async ({ event, resolve }) => {
    const VALID_HOSTNAME = /^(preflight|local)(\.zt|\.ts|\.app)?\.ixvin\.(com|net|cc)$/;
    const isAuthRoute = event.url.pathname.startsWith("/auth/");
    const isAuthApiRoute = event.url.pathname.startsWith("/_api/auth/");

    // 判断是否为移动设备
    // `ismobilejs` needs a hack.
    // log("detectMobile", typeof detectMobile, detectMobile);
    globalThis.isMobile = (detectMobile as any).default(event.request.headers.get("User-Agent") ?? "").any;

    if (event.request.method !== "GET") {
        // 阻止跨域攻击  csrf protection
        const origin = event.request.headers.get("Origin");
        const hostname = event.url.hostname;
        log("server hook, url:", hostname);
        // You can also compare it against the Host or X-Forwarded-Host header.
        // #if PROD
        if (origin === null
            || origin !== DEPLOY_URL
            //  || hostname !== "localhost"
            || !VALID_HOSTNAME.test(hostname)
        ) {
            log.warn("Invalid request:", hostname);
            return new Response(null, {
                status: 403,
            });
        }
        // #endif

        if (isAuthRoute || isAuthApiRoute) {
            // 认证页面与认证 API 不应被未登录态重定向拦截。
            return resolve(event);
        }
    }

    const token = event.cookies.get("session");
    // 没有 session？
    if (token == null) {
        event.locals.session = undefined;
        event.locals.user = undefined;

        // 访问的是不需要登录的页面
        if (event.url.pathname == "/"
            || isAuthRoute
            || isAuthApiRoute
            // || isShareAccessPath(event.url.pathname)
        ) {
            return resolve(event);
        }

        // 登录去吧！
        return redirect(302, "/auth/login");
    }

    const { session } = await validateSessionToken(token);
    if (session == null) {
        deleteSessionTokenCookie(event.cookies);
        return redirect(302, "/auth/login");
    } else {
        setSessionTokenCookie(event.cookies, token, session.expiresAt);
    }

    const rows = await sql<Partial<IAccount>[]>`
        SELECT username, email, display_name, picture, is_active
        FROM account
        WHERE uid = ${session.uid}
    `;
    const account = rows[0];
    if (!account) {
        return redirect(302, "/auth/login");
    }

    if (!account.isActive) {
        deleteSessionTokenCookie(event.cookies);
        event.locals.session = undefined;
        event.locals.user = undefined;
        if (isAuthRoute || isAuthApiRoute) {
            return resolve(event);
        }
        return redirect(302, "/auth/login?error=account_inactive");
    }

    event.locals.session = session;
    event.locals.user = account;

    return resolve(event);
};

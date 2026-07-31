import type { Actions, PageServerLoad } from "./$types";

import { account } from "$lib/server/db";
import { loginWithPasshash } from "$lib/server/auth-login";
import {
    deleteSessionTokenCookie,
    invalidateAllSessions,
} from "$lib/server/session";
import { redirect } from "@sveltejs/kit";

// 登录页只负责渲染与表单 action，真正的登录逻辑复用共享认证函数。
export const load = (async ({ cookies, locals }) => {
    // session validation
    if (locals.session != null) {
        const { uid } = locals.session;
        const accountObj = await account.findAccount({
            uid,
        });
        if (accountObj == null) {
            // 因为各种意外，没有查到对应的账号，认定是非法请求。
            deleteSessionTokenCookie(cookies);
            await invalidateAllSessions(uid);
            locals.session = undefined;
        }

        return {
            session: locals.session,
            account: accountObj,
        };
    }

    return {};
}) satisfies PageServerLoad;

export const actions = {
    // default action is LOGIN
    default: async ({ cookies, request }) => {
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const passhash = formData.get("passhash") as string;

        const r = await loginWithPasshash({
            username,
            passhash,
            cookies,
        });
        if (r.success) {
            redirect(303, `/u/${r.slug!}`);
        } else {
            return r;
        }
    },
} satisfies Actions;

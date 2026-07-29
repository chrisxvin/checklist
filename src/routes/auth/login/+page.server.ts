import type { Actions, PageServerLoad } from "./$types";

import { sql } from "$lib/server/db";
import { loginWithPasshash } from "$lib/server/auth-login";
import {
    deleteSessionTokenCookie,
    invalidateAllSessions,
} from "$lib/server/session";

// 登录页只负责渲染与表单 action，真正的登录逻辑复用共享认证函数。
export const load: PageServerLoad = async ({ cookies, locals }) => {
    // session validation
    if (locals.session != null) {
        const { uid } = locals.session;
        const rows = await sql<IAccount[]>`
            SELECT *
            FROM account
            WHERE uid = ${uid}
        `;
        const accountObj = rows[0];
        if (accountObj == null) {
            // 因为各种意外，没有查到对应的账号，认定是非法请求。
            deleteSessionTokenCookie(cookies);
            await invalidateAllSessions(uid);
            locals.session = null;
        }

        return {
            session: locals.session,
            account: accountObj,
        };
    }

    return {};
};

export const actions = {
    default: async ({ cookies, request }) => {
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const passhash = formData.get("passhash") as string;

        return await loginWithPasshash({
            username,
            passhash,
            cookies,
        });
    },
} satisfies Actions;

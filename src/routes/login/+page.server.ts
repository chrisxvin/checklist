import type { Actions, PageServerLoad } from "./$types";

import { db } from "$lib/server";
import {
    createSession,
    deleteSessionTokenCookie,
    generateSessionToken,
    invalidateAllSessions,
    setSessionTokenCookie,
} from "$lib/server/session";

export const load: PageServerLoad = async ({ cookies, locals }) => {
    // session validation
    if (locals.session != null) {
        const { uid } = locals.session;
        const accountObj = await db.collection<IAccount>("account").findOne<IAccount>(
            { uid },
            {
                projection: {
                    username: 1,
                    email: 1,
                    displayName: 1,
                    picture: 1,
                },
            },
        );
        if (accountObj == null) {
            // 因为各种意外，没有查到对应的账号，认定是非法请求。
            deleteSessionTokenCookie(cookies);
            invalidateAllSessions(uid);
            locals.session = null;
        } else {
            delete accountObj._id;
        }

        return {
            session: locals.session,
            account: accountObj,
        };
    }
};

export const actions = {
    default: async ({ cookies, request }) => {
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const passhash = formData.get("passhash") as string;
        log(`User ${username} is trying to log in with password ${passhash}`);

        // 检查参数
        const accountInDB = await db.collection<IAccount>("account").findOne<IAccount>({ username, passhash });

        if (!accountInDB) {
            return { success: false, message: "用户名或密码不匹配" };
        }

        log(accountInDB);

        const token = generateSessionToken();
        const session = await createSession(token, accountInDB.uid);
        setSessionTokenCookie(cookies, token, session.expiresAt);

        return { success: true };
    },
} satisfies Actions;

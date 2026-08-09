import type { Cookies } from "@sveltejs/kit";

import { account } from "./db";
import { createSession, generateSessionToken, setSessionTokenCookie } from "./session";

type LoginAttempt = {
    username: string;
    passhash: string;
    cookies: Cookies;
};

type LoginAttemptResult = {
    success: boolean;
    message?: string;
};

// 统一处理用户名 + passhash 登录，并在成功时写入 session cookie。
export async function loginWithPasshash({ username, passhash, cookies }: LoginAttempt): Promise<LoginAttemptResult> {
    const normalizedUsername = username.trim();
    const normalizedPasshash = passhash.trim();

    if (!normalizedUsername || !normalizedPasshash) {
        return {
            success: false,
            message: "用户名或密码不能为空",
        };
    }

    const accountInDB = await account.findAccount({
        username: normalizedUsername,
        passhash: normalizedPasshash,
    });

    if (!accountInDB) {
        return {
            success: false,
            message: "用户名或密码不匹配",
        };
    }

    if (!accountInDB.isActive) {
        return {
            success: false,
            message: "账号尚未激活，请联系管理员。",
        };
    }

    const token = generateSessionToken();
    const session = await createSession(token, accountInDB.uid);
    setSessionTokenCookie(cookies, token, session.expiresAt);
    /* TODO: 更新登录时间
    await db.collection<IAccount>("account").updateOne(
        { uid: accountInDB.uid } as any,
        {
            $set: {
                lastLogin: new Date(),
                updatedAt: new Date(),
            },
        },
    );
    */

    return {
        success: true,
    };
}

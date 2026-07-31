import type { OAuth2Tokens } from "arctic";
import type { RequestHandler } from "./$types";

import { error, redirect } from "@sveltejs/kit";
import { decodeIdToken } from "arctic";
import { account } from "$lib/server/db";
import { google } from "$lib/server/oauth";
import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/session";
// import { shouldRequireManualActivation } from "$lib/server/system-settings";

export const GET: RequestHandler = async ({ cookies, url }) => {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies.get("google_oauth_state");
    const codeVerifier = cookies.get("google_code_verifier");
    if (code == null || state == null || storedState == null || codeVerifier == null) {
        log.error("回调参数缺失");
        error(400);
    }
    if (state !== storedState) {
        log.error("回调参数不一致, state !== storedState");
        error(400);
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        log.error("Google 认证失败", e);
        // Invalid code or client credentials
        error(400);
    }
    const claims = decodeIdToken(tokens.idToken()) as IOAuthClaims;
    const existingUser = await account.findAccount({
        googleId: claims.sub,
    });

    let slug: string;
    if (existingUser == null) {
        // const requireManualActivation = await shouldRequireManualActivation();

        // add new user
        const newAccount = await account.createAccountFromGoogle(claims);

        /*
        if (requireManualActivation) {
            redirect(303, "/auth/login?notice=activation_required");
        }
        */

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, newAccount.uid);
        setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
        /*
        await db.account().updateOne(
            { uid: newUid } as any,
            {
                $set: {
                    lastLogin: new Date(),
                    updatedAt: new Date(),
                },
            },
        );
        */

        slug = newAccount.slug;
    } else {
        if (existingUser.isActive === false) {
            redirect(303, "/auth/login?error=account_inactive");
        }

        const sessionToken = generateSessionToken();
        const session = await createSession(sessionToken, existingUser.uid);
        setSessionTokenCookie(cookies, sessionToken, session.expiresAt);
        /*
        await db.account().updateOne(
            { uid: existingUser.uid } as any,
            {
                $set: {
                    lastLogin: new Date(),
                    updatedAt: new Date(),
                },
            },
        );
        */

        slug = existingUser.slug;
    }

    redirect(303, `/u/${slug}`);
};

import type { OAuth2Tokens } from "arctic";
import type { RequestHandler } from "./$types";

import { decodeIdToken } from "arctic";
import { sql } from "$lib/server/db";
import { google } from "$lib/server/oauth";
import { generateSessionToken, createSession, setSessionTokenCookie } from "$lib/server/session";
// import { shouldRequireManualActivation } from "$lib/server/system-settings";
import { emailToUsername } from "$lib/utils";

export const GET: RequestHandler = async ({ cookies, url }) => {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies.get("google_oauth_state");
    const codeVerifier = cookies.get("google_code_verifier");
    if (code == null || state == null || storedState == null || codeVerifier == null) {
        log.error("回调参数缺失");
        return new Response(null, {
            status: 400,
        });
    }
    if (state !== storedState) {
        log.error("回调参数不一致, state !== storedState");
        return new Response(null, {
            status: 400,
        });
    }

    let tokens: OAuth2Tokens;
    try {
        tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (e) {
        log.error("Google 认证失败", e);
        // Invalid code or client credentials
        return new Response(null, {
            status: 400,
        });
    }
    const claims = decodeIdToken(tokens.idToken()) as IOAuthClaims;
    log("google oauth, claims:", claims);
    const googleId = claims.sub;

    // TODO: Replace this with your own DB query.
    // const existingUser = await db.account({ googleId });
    const users = await sql<IAccount[]>`
        SELECT *
        FROM account
        WHERE google_id = ${googleId}
    `;
    const existingUser = users[0];

    if (existingUser != null) {
        if (existingUser.isActive === false) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: "/auth/login?error=account_inactive",
                },
            });
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
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/",
            },
        });
    }

    // const requireManualActivation = await shouldRequireManualActivation();

    // add new user
    const rows = await sql<{ id: number; }[]>`
        INSERT INTO account (username, email, display_name, google_id, picture)
        VALUES (${emailToUsername(claims.email)}, ${claims.email}, ${claims.name}, ${googleId}, ${claims.picture})
        RETURNING id;
    `;
    const newUid = rows[0].id;

    /*
    if (requireManualActivation) {
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/auth/login?notice=activation_required",
            },
        });
    }
    */

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, newUid);
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
    return new Response(null, {
        status: 302,
        headers: {
            Location: "/",
        },
    });
};

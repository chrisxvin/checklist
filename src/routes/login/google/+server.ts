import type { RequestHandler } from "./$types";

import { generateState, generateCodeVerifier } from "arctic";
import { google } from "$lib/server/oauth";

export const GET: RequestHandler = async ({ cookies }) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);

    cookies.set("google_oauth_state", state, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax",
    });
    cookies.set("google_code_verifier", codeVerifier, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax",
    });

    return new Response(null, {
        status: 302,
        headers: {
            Location: url.toString(),
        },
    });
};

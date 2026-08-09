import type { RequestHandler } from "./$types";

import { redirect } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";
import { dev } from "$app/environment";
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
        secure: !dev,
    });
    cookies.set("google_code_verifier", codeVerifier, {
        path: "/",
        httpOnly: true,
        maxAge: 60 * 10, // 10 minutes
        sameSite: "lax",
        secure: !dev,
    });

    redirect(302, url.toString());
};

import { base64Encode, sha256 } from "$lib/utils";
import type { Cookies, RequestEvent } from "@sveltejs/kit";
import db from "./db";

export function generateSessionToken(): string {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    const token = base64Encode(bytes);
    return token;
}

export async function createSession(token: string, userId: number): Promise<ISession> {
    const sessionId = await sha256(token);
    const session: ISession = {
        sid: sessionId,
        uid: userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };
    // db.execute("INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)", session.id, session.userId, Math.floor(session.expiresAt.getTime() / 1000));
    const res = await db.session().insertOne(session);
    //todo: check result
    return session;
}

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
    const sessionId = await sha256(token);
    // const row = db.queryOne("SELECT session.id, session.user_id, session.expires_at, user.id FROM session INNER JOIN user ON user.id = session.user_id WHERE id = ?", sessionId);
    const session = await db.session({ sid: sessionId });
    if (session == null) {
        return { session: undefined };
    }

    if (Date.now() >= session.expiresAt.getTime()) {
        // db.execute("DELETE FROM session WHERE id = ?", session.id);
        const res = await db.session().deleteOne({ sid: sessionId });
        //todo: check result
        return { session: undefined };
    }
    if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
        session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
        // db.execute("UPDATE session SET expires_at = ? WHERE id = ?", Math.floor(session.expiresAt.getTime() / 1000), session.id);
        const res = await db.session().updateOne({ sid: sessionId }, { $set: { expiresAt: session.expiresAt } });
        //todo: check result
    }

    delete session._id;
    return { session };
}

export async function invalidateSession(sessionId: string): Promise<void> {
    // db.execute("DELETE FROM session WHERE id = ?", sessionId);
    await db.session().deleteOne({ sid: sessionId });
}

export async function invalidateAllSessions(userId: number): Promise<void> {
    // await db.execute("DELETE FROM user_session WHERE user_id = ?", userId);
    db.session().deleteMany({ udi: userId });
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date): void {
    cookies.set("session", token, {
        httpOnly: true,
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });
}

export function deleteSessionTokenCookie(cookies: Cookies): void {
    cookies.set("session", "", {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
}

import { useSession } from "@cyysummer/auth-google";
import { db } from "./db";

const {
    generateSessionToken,
    createSession,
    validateSessionToken,
    invalidateSession,
    invalidateAllSessions,
    setSessionTokenCookie,
    deleteSessionTokenCookie,
} = useSession({
    db,
});

export {
    generateSessionToken,
    createSession,
    validateSessionToken,
    invalidateSession,
    invalidateAllSessions,
    setSessionTokenCookie,
    deleteSessionTokenCookie,
};

import { useSession, usePostgresAdapter } from "@buxton/auth-google";
import { sql } from "./db";

const tableName = "session";
const adapter = usePostgresAdapter(sql, tableName);

const {
    generateSessionToken,
    createSession,
    validateSessionToken,
    invalidateSession,
    invalidateAllSessions,
    setSessionTokenCookie,
    deleteSessionTokenCookie,
} = useSession({
    adapter,
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

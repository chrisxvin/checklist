import { emailToUsername, hashLikeRandomId } from "$lib/utils";
import { buildWhere, sql } from "./db";

export async function createAccountFromGoogle(claims: IOAuthClaims): Promise<number> {
    const rows = await sql<{ uid: number; }[]>`
        INSERT INTO account (slug, username, email, display_name, google_id, picture)
        VALUES (${hashLikeRandomId(8)}, ${emailToUsername(claims.email)}, ${claims.email}, ${claims.name}, ${claims.sub}, ${claims.picture})
        RETURNING uid;
    `;
    const newUid = rows[0].uid;
    return newUid;
}

export async function findAccount(acct: Partial<IAccount>) {
    const rows = await sql<IAccount[]>`
        SELECT *
        FROM account
        ${buildWhere(acct, false)}
    `;
    return rows[0];
}

export async function deleteAccount(uid: number) {
    await sql`
        DELETE FROM account
        WHERE uid = ${uid}
    `;
}

export default {
    createAccountFromGoogle,
    findAccount,
    deleteAccount,
};

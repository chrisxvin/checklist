import { emailToUsername } from "$lib/utils";
import { buildWhere, sql } from "./db";

export async function createAccountFromGoogle(claims: IOAuthClaims): Promise<IAccount["uid"]> {
    const [row] = await sql<Pick<IAccount, "uid">[]>`
        INSERT INTO account (username, email, display_name, google_id, picture)
        VALUES (${emailToUsername(claims.email)}, ${claims.email}, ${claims.name}, ${claims.sub}, ${claims.picture})
        RETURNING uid;
    `;
    return row.uid;
}

export async function findAccount(acct: Partial<IAccount>): Promise<IAccountBase> {
    const [row] = await sql<IAccountBase[]>`
        SELECT uid, username, email, display_name, picture, is_active
        FROM account
        ${buildWhere(acct, false)}
    `;
    return row;
}

export async function deleteAccount(uid: number) {
    await sql`
        DELETE FROM account
        WHERE uid = ${uid}
    `;
}

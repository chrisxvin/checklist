import { emailToUsername, hashLikeRandomId } from "$lib/utils";
import { buildWhere, sql } from "./db";

export async function createAccountFromGoogle(claims: IOAuthClaims): Promise<Pick<IAccount, "uid" | "slug">> {
    const slug = hashLikeRandomId(8);
    const rows = await sql<Pick<IAccount, "uid" | "slug">[]>`
        INSERT INTO account (slug, username, email, display_name, google_id, picture)
        VALUES (${slug}, ${emailToUsername(claims.email)}, ${claims.email}, ${claims.name}, ${claims.sub}, ${claims.picture})
        RETURNING uid, slug;
    `;
    return {
        uid: rows[0].uid,
        slug: rows[0].slug,
    };
}

export async function findAccount(acct: Partial<IAccount>): Promise<IAccountBase> {
    const [row] = await sql<IAccountBase[]>`
        SELECT uid, slug, username, email, display_name, picture, is_active
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

import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { sql } from "$lib/server/db";

export const load = (async ({ params,  }) => {
    const rows = sql<ISession[]>`
        SELECT *
        FROM session
        WHERE 
    `;
}) satisfies PageServerLoad;

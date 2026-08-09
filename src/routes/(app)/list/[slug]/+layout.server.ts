import type { LayoutServerLoad } from "./$types";

import { checklist } from "$lib/server/db";

export const load = (async ({ locals, params }) => {
    const rows = await checklist.find({
        ownerId: locals.user.uid,
        slug: params.slug,
    });
    return {
        list: rows[0],
    };
}) satisfies LayoutServerLoad;

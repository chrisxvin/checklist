import type { LayoutServerLoad } from "./$types";

import { checklist } from "$lib/server/db";

export const load = (async ({ params }) => {
    const list = await checklist.findOne(params.accountSlug, params.listSlug);
    return {
        list,
    };
}) satisfies LayoutServerLoad;

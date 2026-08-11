import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { checklist } from "$lib/server/db";

export const load = (async ({ locals, params }) => {
    const list = await checklist.findForEdit({
        ownerId: locals.user.uid,
        slug: params.slug,
    });
    if (!list) {
        error(404, "模板不存在");
    }
    return {
        list,
    };
}) satisfies PageServerLoad;

import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { checklist, run } from "$lib/server/db";

const RECENT_RUNS = 5;

export const load = (async ({ locals, params }) => {
    const [list] = await checklist.find({
        ownerId: locals.user.uid,
        slug: params.slug,
    });
    if (!list) {
        error(404, "模板不存在");
    }

    const recentRuns = await run.listRuns(locals.user.uid, {
        checklistId: list.listId,
        limit: RECENT_RUNS,
    });

    return {
        list,
        recentRuns,
    };
}) satisfies PageServerLoad;

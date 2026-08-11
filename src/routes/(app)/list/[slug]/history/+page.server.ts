import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { checklist, run } from "$lib/server/db";
import { RUN_STATUS_MAP } from "$types/enum-defs";

export const load = (async ({ locals, params, url }) => {
    const [list] = await checklist.find({
        ownerId: locals.user.uid,
        slug: params.slug,
    });
    if (!list) {
        error(404, "模板不存在");
    }

    const statusParam = url.searchParams.get("status");
    const status = statusParam && statusParam in RUN_STATUS_MAP ? Number(statusParam) as RUN_STATUS : undefined;
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;
    const q = url.searchParams.get("q")?.trim() || undefined;

    const runs = await run.listRuns(locals.user.uid, {
        checklistId: list.listId,
        status,
        from,
        to,
        q,
    });

    return {
        list,
        runs,
        filters: { status: status?.toString() ?? "", from: from ?? "", to: to ?? "", q: q ?? "" },
    };
}) satisfies PageServerLoad;

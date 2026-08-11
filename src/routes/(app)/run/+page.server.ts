import type { PageServerLoad } from "./$types";

import { checklist, run } from "$lib/server/db";
import { RUN_STATUS_MAP } from "$types/enum-defs";

export const load = (async ({ locals, url }) => {
    const statusParam = url.searchParams.get("status");
    const status = statusParam && statusParam in RUN_STATUS_MAP ? Number(statusParam) as RUN_STATUS : undefined;
    const checklistParam = url.searchParams.get("checklist");
    const checklistNum = checklistParam ? Number(checklistParam) : NaN;
    const checklistId = Number.isFinite(checklistNum) ? checklistNum : undefined;
    const from = url.searchParams.get("from") || undefined;
    const to = url.searchParams.get("to") || undefined;
    const q = url.searchParams.get("q")?.trim() || undefined;

    const [runs, checklists] = await Promise.all([
        run.listRuns(locals.user.uid, { checklistId, status, from, to, q }),
        checklist.search({ ownerId: locals.user.uid, includeArchived: true }),
    ]);

    return {
        runs,
        checklists,
        filters: {
            checklist: checklistId?.toString() ?? "",
            status: status?.toString() ?? "",
            from: from ?? "",
            to: to ?? "",
            q: q ?? "",
        },
    };
}) satisfies PageServerLoad;

import type { PageServerLoad } from "./$types";

import { checklist } from "$lib/server/db";

export const load = (async ({ locals, url }) => {
    const q = url.searchParams.get("q")?.trim() || undefined;
    const category = url.searchParams.get("category")?.trim() || undefined;
    const includeArchived = url.searchParams.get("archived") === "1";

    const [checklists, categories] = await Promise.all([
        checklist.search({
            ownerId: locals.user.uid,
            q,
            category,
            includeArchived,
        }),
        checklist.categories(locals.user.uid),
    ]);

    return {
        checklists,
        categories,
        filters: { q, category, includeArchived },
    };
}) satisfies PageServerLoad;

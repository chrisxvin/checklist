import type { PageServerLoad } from "./$types";

import { checklist } from "$lib/server/db";

const MAX_STEPS_IN_PREVIEW = 3;
const UNCATEGORIED = "无分类";
export const load = (async ({ locals, params }) => {
    const checklists = await checklist.findAll(params.accountSlug);

    // 预览模式只显示3条
    checklists.forEach(l => {
        l.category ??= UNCATEGORIED;
        l.steps = l.steps.slice(0, MAX_STEPS_IN_PREVIEW).concat([{ content: "..." }]);
    });

    return {
        checklists,
    };
}) satisfies PageServerLoad;

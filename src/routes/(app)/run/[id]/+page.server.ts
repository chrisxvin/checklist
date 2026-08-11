import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { run } from "$lib/server/db";

export const load = (async ({ locals, params }) => {
    const runId = Number(params.id);
    if (!Number.isInteger(runId)) {
        error(400, "无效的执行 ID");
    }

    let runRow;
    try {
        runRow = await run.getRun(locals.user.uid, runId);
    } catch (e) {
        error(404, "执行记录不存在");
    }

    return {
        run: runRow,
    };
}) satisfies PageServerLoad;

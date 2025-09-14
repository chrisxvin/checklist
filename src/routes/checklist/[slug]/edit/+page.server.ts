import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import db from "$lib/server/db";

export const load: PageServerLoad = async ({ params }) => {
    // const resp = await atlasFuncs.getLists();
    const res = await db.templates({
        id: params.slug,
    });
    if (res) {
        // res.forEach((p: any) => p._id = undefined);
        return res;
    }

    error(404, "Not found");
};

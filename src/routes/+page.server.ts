import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
// import { atlasFuncs } from "$lib/server/db";
import db from "$lib/server/db";

export const load: PageServerLoad = async ({ params }) => {
    // const resp = await atlasFuncs.getLists();
    const res = await db.templates().find().toArray();
    if (res) {
        res.forEach((p: any) => p._id = undefined);
        return {
            list: res,
        };
    }

    error(404, "Not found");
};

import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import db from "$lib/server/db";
/*
import { atlasFuncs } from "$lib/server/db";

export async function loadList(id: string): Promise<ICheckList> {
    console.debug("loadList", id);

    const resp = await atlasFuncs.getSingleList(id);

    if (resp && resp.result === 200) {
        return resp.data;
    }

    error(resp.result);
}
*/

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

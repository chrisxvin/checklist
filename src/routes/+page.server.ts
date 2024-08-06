import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { atlasFuncs } from "$lib/server/db";

export const load: PageServerLoad = async ({ params }) => {
    const resp = await atlasFuncs.getLists();

    if (resp && resp.result === 200) {
        return {
            lists: resp.data,
        };
    }

    error(resp.result);
};

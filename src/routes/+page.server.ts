import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { toPOJO } from "$lib/utils/mongo";

export const load: PageServerLoad = async ({ params }) => {
    const lists = await db.collection<ICheckList>("checklist").find();

    if (lists) {
        return {
            lists: toPOJO(lists),
        };
    }

    error(404, "Not found");
};

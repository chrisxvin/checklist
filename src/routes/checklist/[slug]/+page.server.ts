import type { PageServerLoad } from "./$types";

import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { toPOJO } from "$lib/utils/mongo";
import { BSON } from "realm-web";

export const load: PageServerLoad<ICheckList> = async ({ params }) => {
    const list = await db.collection<ICheckList>("checklist").findOne({
        _id: new BSON.ObjectId(params.slug),
    });

    if (list) {
        return toPOJO(list);
    }

    error(404, "Not found");
};

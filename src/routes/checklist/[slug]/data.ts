import { error } from "@sveltejs/kit";
import { atlasFuncs } from "$lib/server/db";

export async function loadList(id: string): Promise<ICheckList> {
    console.debug("loadList", id);

    const resp = await atlasFuncs.getSingleList(id);

    if (resp && resp.result === 200) {
        return resp.data;
    }

    error(resp.result);
}

import type { PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
    if (locals.session != null) {
        redirect(302, "/list");
    }
    return {};
}) satisfies PageServerLoad;

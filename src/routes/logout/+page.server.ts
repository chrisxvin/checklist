import type { Actions, PageServerLoad } from "./$types";

import { redirect } from "@sveltejs/kit";
import { invalidateSession, deleteSessionTokenCookie } from "$lib/server/session";

export const load: PageServerLoad = async ({ locals }) => {
    // ...
};

export const actions: Actions = {
    default: async event => {
        if (event.locals.session) {
            await invalidateSession(event.locals.session.sid);
            deleteSessionTokenCookie(event.cookies);
        }

        return redirect(303, "/login");
    },
};

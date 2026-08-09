import type { LayoutServerLoad } from "./$types";

export const load = (async ({ locals }) => {
    return {
        logined: locals.session != null,
        user: locals.user,
    };
}) satisfies LayoutServerLoad;

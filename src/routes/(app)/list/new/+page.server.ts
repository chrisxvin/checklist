import type { Actions, PageServerLoad } from "./$types";

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions = {
    // default action is SAVE
    default: async ({ cookies, request }) => {
        const formData = await request.formData();
        const username = formData.get("username") as string;
        const passhash = formData.get("passhash") as string;

        /*
        const r = await loginWithPasshash({
            username,
            passhash,
            cookies,
        });
        if (r.success) {
            redirect(303, `/home`);
        } else {
            return r;
        }
        */
    },
} satisfies Actions;

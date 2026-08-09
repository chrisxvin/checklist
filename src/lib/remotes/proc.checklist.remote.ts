import * as v from "valibot";
import { redirect } from "@sveltejs/kit";
import { getRequestEvent, form, command } from "$app/server";
import { create, finalize, isValid } from "$lib/server/db/proc.checklist";
import { generateNewSlug } from "$lib/utils/checklist";
import { EXECUTION_MODE } from "$types/enum-defs";

export const createList = form(
    v.object({
        name: v.pipe(v.string(), v.nonEmpty()),
        description: v.optional(v.string()),
        category: v.optional(v.string()),
        executionMode: v.pipe(
            v.union([v.string(), v.number()]),
            v.transform(Number),
            v.integer(),
            v.minValue(EXECUTION_MODE.Free),
            v.maxValue(EXECUTION_MODE.Strict)
        ),
        steps: v.array(v.object({
            content: v.pipe(v.string(), v.nonEmpty()),
        })),
    }),
    async ({ name, category, description, executionMode, steps },) => {
        log("createList", name, category, description, executionMode, steps);
        const { locals } = getRequestEvent();

        // Generate a slug
        const slug = generateNewSlug();

        // Write to db
        await create({
            ownerId: locals.user.uid,
            slug,
            name,
            description,
            category,
            executionMode,
        }, steps);

        // Redirect to the newly created list
        redirect(303, `/list/${slug}`);
    },
);

export const finalizeList = command(v.string(), async (listId) => {
    const { locals } = getRequestEvent();
    const v = await isValid({
        ownerId: locals.user.uid,
        listId,
    });
    if (!v) {
        log.error("Remote::Checklist::finalizeList, invalid uid and listId");
        throw new Error("Invalid request");
    }

    await finalize(listId);
});

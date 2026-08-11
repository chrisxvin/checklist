import * as v from "valibot";
import { error, redirect } from "@sveltejs/kit";
import { getRequestEvent, form, command } from "$app/server";
import { archive, create, finalize, isValid, unarchive, update } from "$lib/server/db/proc.checklist";
import { generateNewSlug } from "$lib/utils/checklist";
import { EXECUTION_MODE } from "$types/enum-defs";

// ---------------------------------------------------------------------------
// 校验
// ---------------------------------------------------------------------------

const stepSchema = v.object({
    content: v.pipe(v.string(), v.minLength(1), v.maxLength(200)),
    description: v.optional(v.pipe(v.string(), v.maxLength(255))),
    groupName: v.optional(v.pipe(v.string(), v.maxLength(255))),
    isSkippable: v.optional(v.boolean(), true),
});

/** 步骤数组以 JSON 字符串形式放在隐藏输入里提交，服务端解析并校验 */
const stepsField = v.pipe(
    v.string(),
    v.transform(s => {
        try {
            return JSON.parse(s);
        } catch {
            return [];
        }
    }),
    v.array(stepSchema),
    v.minLength(1, "至少需要一个步骤"),
);

const instanceSchemaBase = v.object({
    name: v.pipe(v.string(), v.minLength(1), v.maxLength(120)),
    description: v.optional(v.pipe(v.string(), v.maxLength(255))),
    category: v.optional(v.pipe(v.string(), v.maxLength(255))),
    icon: v.optional(v.pipe(v.string(), v.maxLength(255))),
    executionMode: v.pipe(
        v.union([v.string(), v.number()]),
        v.transform(Number),
        v.integer(),
        v.minValue(EXECUTION_MODE.Free),
        v.maxValue(EXECUTION_MODE.Strict)
    ),
    steps: stepsField,
});
const createInstanceSchema = instanceSchemaBase;
const updateInstanceSchema = v.object({
    ...instanceSchemaBase.entries,
    listId: v.string(),
    verId: v.string(),
    slug: v.string(),
});

// ---------------------------------------------------------------------------
// 模板
// ---------------------------------------------------------------------------

export const createList = form(
    createInstanceSchema,
    async ({ name, category, description, icon, executionMode, steps }) => {
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
            icon,
            executionMode,
        }, steps);

        // Redirect to the newly created list
        redirect(303, `/list/${slug}`);
    },
);

export const updateList = form(
    updateInstanceSchema,
    async ({ listId, verId, slug, name, category, description, icon, executionMode, steps }) => {
        const { locals } = getRequestEvent();
        const v = await isValid({
            ownerId: locals.user.uid,
            listId,
        });
        if (!v) {
            log.error("Remote::Checklist::updateList, invalid ownerId and listId");
            throw error(400, "Invalid request");
        }

        await update({
            listId,
            verId,
            name,
            description,
            category,
            icon,
            executionMode,
            steps,
        });

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
        log.error("Remote::Checklist::finalizeList, invalid ownerId and listId");
        throw error(400, "Invalid request");
    }

    await finalize(listId);
});

export const archiveList = command(v.string(), async (listId) => {
    const { locals } = getRequestEvent();
    const v = await isValid({
        ownerId: locals.user.uid,
        listId,
    });
    if (!v) {
        throw error(400, "Invalid request");
    }

    await archive(listId);
});

export const unarchiveList = command(v.string(), async (listId) => {
    const { locals } = getRequestEvent();
    const v = await isValid({
        ownerId: locals.user.uid,
        listId,
    });
    if (!v) {
        throw error(400, "Invalid request");
    }

    await unarchive(listId);
});

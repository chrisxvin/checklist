import * as v from "valibot";
import { error, redirect } from "@sveltejs/kit";
import { getRequestEvent, form, command } from "$app/server";
import * as runProc from "$lib/server/db/proc.run";

/** 把领域错误转为可返回给前端的 HTTP 错误；已存在的 HttpError 原样抛出 */
function toHttpError(e: unknown): never {
    if (e instanceof Error && "status" in e) {
        throw e;
    }
    error(400, e instanceof Error ? e.message : "操作失败");
}

/** 开始执行：立即创建 Run 并跳转到执行页 */
export const startRun = form(
    v.object({
        listId: v.string(),
    }),
    async ({ listId }) => {
        const { locals } = getRequestEvent();
        let runId: number;
        try {
            runId = await runProc.startRun(locals.user.uid, listId);
        } catch (e) {
            toHttpError(e);
        }
        redirect(303, `/run/${runId!}`);
    },
);

const stepUpdateSchema = v.object({
    runId: v.number(),
    position: v.number(),
    result: v.union([v.literal("success"), v.literal("failure"), v.literal("skip")]),
    skipReason: v.nullish(v.pipe(v.string(), v.maxLength(255))),
});

/** 处理一步（成功/失败/跳过）。返回更新后的 steps 快照。 */
export const updateStep = command(
    stepUpdateSchema,
    async ({ runId, position, result, skipReason }) => {
        const { locals } = getRequestEvent();
        try {
            return await runProc.updateStep(locals.user.uid, runId, position, result, skipReason);
        } catch (e) {
            toHttpError(e);
        }
    },
);

/** 撤销一步，恢复为未处理。返回更新后的 steps 快照。 */
export const resetStep = command(
    v.object({
        runId: v.number(),
        position: v.number(),
    }),
    async ({ runId, position }) => {
        const { locals } = getRequestEvent();
        try {
            return await runProc.resetStep(locals.user.uid, runId, position);
        } catch (e) {
            toHttpError(e);
        }
    },
);

/** 更新执行备注 */
export const updateNote = command(
    v.object({
        runId: v.number(),
        note: v.optional(v.pipe(v.string(), v.maxLength(255))),
    }),
    async ({ runId, note }) => {
        const { locals } = getRequestEvent();
        try {
            await runProc.updateNote(locals.user.uid, runId, note ?? null);
        } catch (e) {
            toHttpError(e);
        }
    },
);

/** 完成执行（服务端校验全部步骤已处理） */
export const completeRun = command(
    v.object({ runId: v.number() }),
    async ({ runId }) => {
        const { locals } = getRequestEvent();
        try {
            await runProc.completeRun(locals.user.uid, runId);
        } catch (e) {
            toHttpError(e);
        }
    },
);

/** 取消执行（保留已处理快照） */
export const cancelRun = command(
    v.object({ runId: v.number() }),
    async ({ runId }) => {
        const { locals } = getRequestEvent();
        try {
            await runProc.cancelRun(locals.user.uid, runId);
        } catch (e) {
            toHttpError(e);
        }
    },
);

import { EXECUTION_MODE, RUN_STATUS } from "$types/enum-defs";
import { sql } from "./db";

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

/** 模板步骤 -> Run 快照步骤（扩展执行字段，初始均未处理） */
export function snapshotSteps(steps: IStep[]): IRunStep[] {
    return steps.map(s => ({
        content: s.content,
        description: s.description ?? null,
        groupName: s.groupName ?? null,
        isSkippable: s.isSkippable !== false,
        checked: null,
        resolvedAt: null,
        skipReason: null,
    }));
}

export type StepResult = "success" | "failure" | "skip";

/** 校验“设置结果”是否符合执行模式 */
function validateResult(mode: EXECUTION_MODE, steps: IRunStep[], position: number, step: IRunStep, result: StepResult) {
    if (mode !== EXECUTION_MODE.Free) {
        // 顺序 / 严格模式：只能处理第一个未处理步骤
        const firstUnresolved = steps.findIndex(s => s.resolvedAt == null);
        if (firstUnresolved !== position - 1) {
            throw new Error("顺序/严格模式下只能处理第一个未处理步骤。");
        }
    }

    if (result === "skip") {
        if (step.isSkippable === false) {
            throw new Error("该步骤不允许跳过。");
        }
        if (mode === EXECUTION_MODE.Strict) {
            throw new Error("严格模式下不允许跳过。");
        }
    }
}

function assertInProgress(run: { status: RUN_STATUS }) {
    if (run.status !== RUN_STATUS.InProgress) {
        throw new Error("该执行已结束，无法修改。");
    }
}

// ---------------------------------------------------------------------------
// 执行
// ---------------------------------------------------------------------------

/** 从模板最新版本创建 Run（status=1，立即开始计时）。返回 run id。 */
export async function startRun(ownerId: number, listId: string): Promise<number> {
    return sql.begin(async SQL => {
        const [list] = await SQL<IChecklistInstance[]>`
            SELECT *
            FROM checklist_latest
            WHERE owner_id = ${ownerId} AND list_id = ${listId}
        `;
        if (!list) {
            throw new Error("Invalid request.");
        }
        if (list.drafting) {
            throw new Error("模板仍是草稿，请先定稿后再执行。");
        }
        if (list.archivedAt != null) {
            throw new Error("模板已归档，无法开始执行。");
        }

        const [row] = await SQL<{ id: number }[]>`
            INSERT INTO run_instance (list_id, list_version_id, list_version, status, started_by, started_at, steps)
            VALUES (${Number(list.listId)}, ${Number(list.verId)}, ${list.version}, ${RUN_STATUS.InProgress}, ${ownerId}, now(), ${SQL.json(snapshotSteps(list.steps) as any)}::jsonb)
            RETURNING id
        `;
        return row.id;
    });
}

/** 读取单个 Run（含模板冗余信息与耗时），校验归属 */
export async function getRun(ownerId: number, runId: number): Promise<IRunInstance> {
    const [row] = await sql<IRunInstance[]>`
        SELECT r.*, c.slug, c.name, c.icon, c.execution_mode,
            CASE WHEN r.finished_at IS NOT NULL AND r.started_at IS NOT NULL
                 THEN EXTRACT(EPOCH FROM (r.finished_at - r.started_at)) * 1000 END::float8 AS duration_ms
        FROM run_instance r
        JOIN checklist c ON c.id = r.list_id
        WHERE r.id = ${runId} AND r.started_by = ${ownerId}
    `;
    if (!row) {
        throw new Error("Invalid request.");
    }
    return row;
}

/** 处理一步：成功 / 失败 / 跳过。校验执行模式后写入快照。返回更新后的 steps。 */
export async function updateStep(
    ownerId: number,
    runId: number,
    position: number,
    result: StepResult,
    skipReason?: string | null,
): Promise<IRunStep[]> {
    return sql.begin(async SQL => {
        const [run] = await SQL<{ status: RUN_STATUS; executionMode: EXECUTION_MODE; steps: IRunStep[] }[]>`
            SELECT r.status, c.execution_mode, r.steps
            FROM run_instance r
            JOIN checklist c ON c.id = r.list_id
            WHERE r.id = ${runId} AND r.started_by = ${ownerId}
            FOR UPDATE OF r
        `;
        if (!run) {
            throw new Error("Invalid request.");
        }
        assertInProgress(run);

        const steps = run.steps as IRunStep[];
        const idx = position - 1;
        if (idx < 0 || idx >= steps.length) {
            throw new Error("无效的步骤位置。");
        }
        const step = steps[idx];
        validateResult(run.executionMode ?? EXECUTION_MODE.Free, steps, position, step, result);

        step.checked = result === "success" ? true : result === "failure" ? false : null;
        step.resolvedAt = new Date().toISOString();
        step.skipReason = result === "skip" ? (skipReason?.trim() || null) : null;

        await SQL`
            UPDATE run_instance
            SET steps = ${sql.json(steps as any)}::jsonb
            WHERE id = ${runId}
        `;
        return steps;
    });
}

/** 撤销一步，恢复为未处理。自由模式可撤销任意一步；顺序/严格模式只能撤销最近处理的一步。 */
export async function resetStep(ownerId: number, runId: number, position: number): Promise<IRunStep[]> {
    return sql.begin(async SQL => {
        const [run] = await SQL<{ status: RUN_STATUS; executionMode: EXECUTION_MODE; steps: IRunStep[] }[]>`
            SELECT r.status, c.execution_mode, r.steps
            FROM run_instance r
            JOIN checklist c ON c.id = r.list_id
            WHERE r.id = ${runId} AND r.started_by = ${ownerId}
            FOR UPDATE OF r
        `;
        if (!run) {
            throw new Error("Invalid request.");
        }
        assertInProgress(run);

        const steps = run.steps as IRunStep[];
        const idx = position - 1;
        if (idx < 0 || idx >= steps.length) {
            throw new Error("无效的步骤位置。");
        }
        const step = steps[idx];
        if (step.resolvedAt == null) {
            throw new Error("该步骤尚未处理，无需撤销。");
        }

        if (run.executionMode !== EXECUTION_MODE.Free) {
            let lastResolvedIdx = -1;
            for (let i = steps.length - 1; i >= 0; i--) {
                if (steps[i].resolvedAt != null) {
                    lastResolvedIdx = i;
                    break;
                }
            }
            if (lastResolvedIdx !== idx) {
                throw new Error("顺序/严格模式下只能撤销最近处理的一步。");
            }
        }

        step.checked = null;
        step.resolvedAt = null;
        step.skipReason = null;

        await SQL`
            UPDATE run_instance
            SET steps = ${sql.json(steps as any)}::jsonb
            WHERE id = ${runId}
        `;
        return steps;
    });
}

/** 更新执行备注（仅进行中的 Run） */
export async function updateNote(ownerId: number, runId: number, note: string | null) {
    const [row] = await sql`
        UPDATE run_instance
        SET note = ${note?.trim() || null}
        WHERE id = ${runId} AND started_by = ${ownerId} AND status = ${RUN_STATUS.InProgress}
        RETURNING id
    `;
    if (!row) {
        throw new Error("Invalid request.");
    }
}

/** 完成 Run：要求全部步骤已处理。 */
export async function completeRun(ownerId: number, runId: number): Promise<void> {
    await sql.begin(async SQL => {
        const [run] = await SQL<{ status: RUN_STATUS; steps: IRunStep[] }[]>`
            SELECT status, steps
            FROM run_instance
            WHERE id = ${runId} AND started_by = ${ownerId}
            FOR UPDATE
        `;
        if (!run) {
            throw new Error("Invalid request.");
        }
        assertInProgress(run);

        const unresolved = (run.steps as IRunStep[]).filter(s => s.resolvedAt == null).length;
        if (unresolved > 0) {
            throw new Error(`还有 ${unresolved} 个步骤未处理，无法完成。`);
        }

        await SQL`
            UPDATE run_instance
            SET status = ${RUN_STATUS.Completed}, finished_at = now()
            WHERE id = ${runId}
        `;
    });
}

/** 取消 Run（保留已处理的快照与 meta）。 */
export async function cancelRun(ownerId: number, runId: number): Promise<void> {
    await sql.begin(async SQL => {
        const [run] = await SQL<{ status: RUN_STATUS }[]>`
            SELECT status
            FROM run_instance
            WHERE id = ${runId} AND started_by = ${ownerId}
            FOR UPDATE
        `;
        if (!run) {
            throw new Error("Invalid request.");
        }
        assertInProgress(run);

        await SQL`
            UPDATE run_instance
            SET status = ${RUN_STATUS.Cancelled}, finished_at = now()
            WHERE id = ${runId}
        `;
    });
}

// ---------------------------------------------------------------------------
// 历史列表
// ---------------------------------------------------------------------------

export interface RunListFilter {
    /** 指定模板（list_id） */
    checklistId?: number | string;
    status?: RUN_STATUS;
    /** 起始日期 yyyy-MM-dd（含） */
    from?: string;
    /** 截止日期 yyyy-MM-dd（含） */
    to?: string;
    /** 关键词：匹配模板名或备注 */
    q?: string;
    limit?: number;
}

const durationExpr = sql`CASE WHEN r.finished_at IS NOT NULL AND r.started_at IS NOT NULL
    THEN EXTRACT(EPOCH FROM (r.finished_at - r.started_at)) * 1000 END::float8`;

/** 当前用户所有 Run，按开始时间倒序；join 模板冗余信息 */
export async function listRuns(ownerId: number, filter: RunListFilter = {}): Promise<IRunInstance[]> {
    const { checklistId, status, from, to, q, limit } = filter;
    const rows = sql<IRunInstance[]>`
        SELECT r.*, c.slug, c.name, c.icon, c.execution_mode,
            ${durationExpr} AS duration_ms
        FROM run_instance r
        JOIN checklist c ON c.id = r.list_id
        WHERE r.started_by = ${ownerId}
            ${checklistId != null ? sql`AND r.list_id = ${Number(checklistId)}` : sql``}
            ${status != null ? sql`AND r.status = ${status}` : sql``}
            ${from ? sql`AND r.started_at >= ${from}::date` : sql``}
            ${to ? sql`AND r.started_at < (${to}::date + interval '1 day')` : sql``}
            ${q ? sql`AND (c.name ILIKE ${"%" + q + "%"} OR r.note ILIKE ${"%" + q + "%"})` : sql``}
        ORDER BY r.started_at DESC
        ${limit != null ? sql`LIMIT ${limit}` : sql``}
    `;
    return rows;
}

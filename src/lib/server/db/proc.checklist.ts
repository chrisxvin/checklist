import { buildWhere, sql } from "./db";

export async function find(filter: {
    ownerId: number;
    slug?: string;
}): Promise<IChecklistInstance[]> {
    const rows = sql<IChecklistInstance[]>`
        SELECT *
        FROM checklist_latest
        ${buildWhere(filter)}
    `;
    return rows;
}

export async function findForEdit(filter: {
    ownerId: number;
    slug: string;
}) {
    const { ownerId, slug } = filter;
    return sql.begin(async SQL => {
        const [row] = await SQL<IChecklistInstance[]>`
            SELECT *
            FROM checklist_latest
            WHERE owner_id = ${ownerId} AND slug = ${slug}
        `;

        if (!row) {
            log.error("DB::Checklist::findForEdit, ownerId and slug do not match.");
            throw new Error("Invalid request.");
        }

        // 如果已定稿，那么生成新的版本（进入草稿态）。
        if (!row.drafting) {
            log.trace("DB::Checklist::findForEdit, list id:", row.listId, "is not in drafting mode. Creating new version.");

            const newVer = row.version + 1;
                await SQL`
                INSERT INTO checklist_version (list_id, version, steps)
                VALUES (${row.listId}, ${newVer}, (SELECT steps FROM checklist_version WHERE list_id = ${row.listId} AND version = ${row.version}))
            `;
            await SQL`
                UPDATE checklist
                SET drafting = true, current_version = ${newVer}
                WHERE owner_id = ${ownerId} AND slug = ${slug}
            `;
            row.drafting = true;
            row.version = newVer;
        } else {
            log.trace("DB::Checklist::findForEdit, list id:", row.listId, "is in drafting mode.");
        }

        return row;
    });
}

export async function create(list: NewChecklist, steps: IStep[]) {
    return sql.begin(async SQL => {
        const [row] = await SQL<{ id: string; }[]>`
            INSERT INTO checklist (owner_id, slug, name, description, category, icon, execution_mode, current_version)
            VALUES (${list.ownerId}, ${list.slug}, ${list.name}, ${list.description!}, ${list.category!}, ${list.icon!}, ${list.executionMode}, 1)
            RETURNING id;
        `;
        await SQL`
            INSERT INTO checklist_version (list_id, version, steps)
            VALUES (${row.id}, 1, ${SQL.json(steps as any)}::jsonb)
        `;
    });
}

/** 保存草稿：原地更新最新版本与元数据（不产生新版本）。 */
export async function update(list: UpdateChecklist) {
    await sql.begin(async SQL => {
        await SQL`
            UPDATE checklist
            SET drafting = true, name = ${list.name}, description = ${list.description!}, category = ${list.category!}, icon = ${list.icon!}, execution_mode = ${list.executionMode}, updated_at = now()
            WHERE id = ${list.listId}
        `;
        await SQL`
            UPDATE checklist_version
            SET steps = ${sql.json(list.steps as any)}::jsonb, created_at = now()
            WHERE id = ${list.verId}
        `;
    });
}

export async function finalize(listId: string) {
    await sql`
        UPDATE checklist
        SET drafting = false, updated_at = now()
        WHERE id = ${listId}
    `;
}

export async function archive(listId: string) {
    await sql`
        UPDATE checklist
        SET archived_at = now(), updated_at = now()
        WHERE id = ${listId}
    `;
}

export async function unarchive(listId: string) {
    await sql`
        UPDATE checklist
        SET archived_at = null, updated_at = now()
        WHERE id = ${listId}
    `;
}

export interface ChecklistSearchFilter {
    ownerId: number;
    /** 关键词：匹配名称或描述 */
    q?: string;
    category?: string;
    /** 是否包含已归档的模板；默认只显示活跃模板 */
    includeArchived?: boolean;
}

/** 模板库列表：搜索 + 分类筛选，按更新时间倒序 */
export async function search(filter: ChecklistSearchFilter): Promise<IChecklistInstance[]> {
    const { ownerId, q, category, includeArchived } = filter;
    const rows = sql<IChecklistInstance[]>`
        SELECT *
        FROM checklist_latest
        WHERE owner_id = ${ownerId}
            ${includeArchived ? sql`` : sql`AND archived_at IS NULL`}
            ${q ? sql`AND (name ILIKE ${"%" + q + "%"} OR description ILIKE ${"%" + q + "%"})` : sql``}
            ${category ? sql`AND category = ${category}` : sql``}
        ORDER BY updated_at DESC
    `;
    return rows;
}

/** 当前用户使用的全部分类（按使用频率倒序） */
export async function categories(ownerId: number): Promise<string[]> {
    const rows = await sql<{ category: string }[]>`
        SELECT category, count(*) as cnt
        FROM checklist
        WHERE owner_id = ${ownerId} AND category IS NOT NULL AND category <> ''
        GROUP BY category
        ORDER BY cnt DESC, category ASC
    `;
    return rows.map(r => r.category);
}

export async function isValid(filter: Partial<IChecklistInstance>): Promise<boolean> {
    const [row] = await sql`
        SELECT count(1) as count
        FROM checklist_latest
        ${buildWhere(filter)}
    `;
    return row.count > 0;
}

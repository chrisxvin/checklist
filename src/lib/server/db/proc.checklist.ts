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

export async function findOne(ownerId: number, listSlug: string): Promise<IChecklistInstance> {
    const [row] = await sql<IChecklistInstance[]>`
        SELECT *
        FROM checklist_latest
        WHERE owner_id = ${ownerId} AND list_slug = ${listSlug}
    `;
    return row;
}

export async function create(list: NewChecklist, steps: IStep[]) {
    sql.begin(async SQL => {
        const [row] = await SQL<{ id: string; }[]>`
            INSERT INTO checklist (owner_id, slug, name, description, category, execution_mode, current_version)
            VALUES (${list.ownerId}, ${list.slug}, ${list.name}, ${list.description!}, ${list.category!}, ${list.executionMode}, 1)
            RETURNING id;
        `;
        await SQL`
            INSERT INTO checklist_version (list_id, version, steps)
            VALUES (${row.id}, 1, ${SQL.json(steps as any)}::jsonb)
        `;
    });
}

import type { Fragment } from "postgres";

import postgres from "postgres";
import { env } from "$env/dynamic/private";

export const sql = postgres(env.DB_URL, {
    transform: {
        // 自动将数据库的 snake_case 转为 camelCase，以适应前端接口。
        ...postgres.camel,
        // 将 undefined 映射为数据库 null
        undefined: null,
    },
});

export function buildWhere(obj: Record<string, any>, allowEmpty = true) {
    const parts: Fragment[] = [];

    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;

        if (parts.length) {
            parts.push(sql` AND `);
        }

        if (value === null) {
            parts.push(sql`${sql(key)} IS NULL`);
        } else {
            parts.push(sql`${sql(key)} = ${value}`);
        }
    }

    if (!parts.length) {
        if (allowEmpty) {
            return sql``;
        }

        throw new Error("No valid parameters provided.");
    }

    return sql`WHERE ${parts}`;
}

import type { Fragment, Sql } from "postgres";

export function usePostgres(sql: Sql) {
    function buildWhere(obj: Record<string, any>, allowEmpty = true) {
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

    return {
        buildWhere,
    };
}

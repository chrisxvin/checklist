
import postgres from "postgres";
import { env } from "$env/dynamic/private";
import { usePostgres } from "$lib/extended/postgres";

export const sql = postgres(env.DB_URL, {
    transform: {
        // 自动将数据库的 snake_case 转为 camelCase，以适应前端接口。
        ...postgres.camel,
        // 将 undefined 映射为数据库 null
        undefined: null,
    },
});

const {
    buildWhere
} = usePostgres(sql);

export {
    buildWhere,
};

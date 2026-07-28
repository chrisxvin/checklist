import postgres from "postgres";
import { env } from "$env/dynamic/private";

export const sql = postgres(env.DB_URL, {
    transform: {
        ...postgres.camel,
        undefined: null,
    },
});

export function connect() {

}

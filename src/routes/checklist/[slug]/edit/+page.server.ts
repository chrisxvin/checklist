import type { PageServerLoad } from "./$types";

import { loadList } from "../data";

export const load: PageServerLoad<ICheckList> = async ({ params }) => loadList(params.slug);

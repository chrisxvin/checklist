import { hashLikeRandomId } from "./crypto";

export function generateNewSlug() {
    return hashLikeRandomId(8);
}

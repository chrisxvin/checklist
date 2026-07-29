import { Google } from "arctic";
import { DEPLOY_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

export const google = new Google(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${DEPLOY_URL}/auth/login/google/callback`,
);

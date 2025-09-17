import { Google } from "arctic";
import { DEPLOY_HOST, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "$env/static/private";

export const google = new Google(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `//${DEPLOY_HOST}/login/google/callback`,
);

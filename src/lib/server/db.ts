import * as Realm from "realm-web";
import * as env from "$env/static/private";

// Add your App ID
const app = new Realm.App({ id: env.MONGO_ATLAS_APP_ID });

// Create an anonymous credential
const credentials = Realm.Credentials.apiKey(env.MONGO_ATLAS_API_KEY);

// Authenticate the user
const user = await app.logIn(credentials);
// `App.currentUser` updates to match the logged in user
console.assert(user.id === app.currentUser?.id);
const client = user.mongoClient("mongodb-atlas");
const db = client.db("things");

export {
    db,
};

import type { Collection, Document, Filter } from "mongodb";
import { MongoClient, ObjectId } from "mongodb";

import * as Realm from "realm-web";
//import * as env from "$env/static/private";
import { building } from "$app/environment";
import { env } from "$env/dynamic/private";


// Connection URL
const DEFAULT_DB_URL = "mongodb://localhost:27017";
const DB_URL_RAW = building ? DEFAULT_DB_URL : env.DB_URL;
const DB_NAME = "checklist";

const client = new MongoClient(DB_URL_RAW);

export const db = client.db(DB_NAME);

export async function connect() {
    await client.connect();
    log("MongoDB connected.");
}

const collectionMap: Map<string, Collection<any>> = new Map();

function shortcut<T extends Document>(name: string, filter?: Filter<T>) {
    let coll = collectionMap.get(name) as Collection<T>;
    if (!coll) {
        coll = db.collection<T>(name);
        collectionMap.set(name, coll);
    }

    if (filter) {
        return coll.findOne<T>(filter);
    } else {
        return coll;
    }
}

function shortcutFactory<T extends Document>(name: string) {
    /** Return the collection. */
    function f(): Collection<T>;
    /** FindOne by filter. */
    function f(filter: Filter<T>): Promise<T | null>;
    function f(filter?: Filter<T>): Collection<T> | Promise<T | null> {
        return shortcut<T>(name, filter);
    }

    return f;
}

const account = shortcutFactory<IAccount>("account");
const session = shortcutFactory<ISession>("session");
const templates = shortcutFactory<ITemplate>("template");
const instances = shortcutFactory<IInstance>("instance");

export default {
    db,
    account,
    session,
    templates,
    instances,
};

/*
let _funcs: IAtlasFunctions | undefined = undefined;

export async function connect() {
    // Add your App ID
    const app = new Realm.App({ id: env.MONGO_ATLAS_APP_ID });

    // Create an anonymous credential
    const credentials = Realm.Credentials.apiKey(env.MONGO_ATLAS_API_KEY);

    // Authenticate the user
    const user = await app.logIn(credentials);

    _funcs = user.functions as IAtlasFunctions;

    log("MongoDB connected.");
}

// export remote functions caller
export const atlasFuncs = () => _funcs;

// `App.currentUser` updates to match the logged in user
// console.assert(user.id === app.currentUser?.id);

// const client = user.mongoClient("mongodb-atlas");
// const db = client.db("things");
*/

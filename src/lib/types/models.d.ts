declare global {
    // Define type alias; available via `realm-web`
    type MongoDocument = globalThis.Realm.Services.MongoDB.Document;

    interface ICheckItem {
        checked: boolean;
        content: string;
        comment?: string;
        shouldBe: string;
    }

    interface ICheckList extends MongoDocument {
        name: string;
        description?: string;
        items: ICheckItem[];
    }
}

export {};

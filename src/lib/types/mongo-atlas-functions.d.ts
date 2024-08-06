declare global {
    interface IAtlasResponse<T> {
        result: number;
        data: T;
    }

    interface IAtlasFunctions extends Realm.DefaultFunctionsFactory {
        getLists(): Promise<IAtlasResponse<ICheckList[]>>;
        getSingleList(id: string): Promise<IAtlasResponse<ICheckList>>;
    }
}

export {};

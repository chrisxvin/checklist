interface IChecklistInstance {
    listId: string;
    slug: string;
    name: string;
    description?: string;
    category?: string;
    icon?: string;
    drafting: boolean;
    updatedAt: Date;
    verId: string;
    version: number;
    executionMode: EXECUTION_MODE;
    steps: IStep[];
    ownerId: number;
}

interface IChecklistInstance {
    listId: string;
    slug: string;
    name: string;
    description?: string;
    category?: string;
    icon?: string;
    drafting: boolean;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    verId: string;
    version: number;
    executionMode: EXECUTION_MODE;
    steps: IStep[];
    ownerId: number;
}

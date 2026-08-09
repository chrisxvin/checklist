interface IChecklistInstance {
    listId: string;
    listSlug: string;
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
}

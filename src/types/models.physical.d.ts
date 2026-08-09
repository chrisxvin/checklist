declare global {
    // #region old
    interface ITemplate {
        /**
         * 对应文档的 _id.
         */
        id: string;
        name: string;
        description?: string;
        owner: number;
        public: boolean;
        items: ITemplateItem[];
    }

    interface ITemplateItem {
        /** @deprecated */
        checked: boolean;
        content: string;
        shouldBe?: string;
        comment?: string;
    }

    interface IInstance {
        /**
         * 对应文档的 _id.
         */
        id: string;
        // Template Id
        tid: string;
        state: boolean[];
    }
    // #endregion

    interface IChecklist {
        // int8
        id: string;
        ownerId: number;
        slug: string;
        name: string;
        description?: string;
        category?: string;
        icon?: string;
        executionMode: EXECUTION_MODE;
        currentVersion: number;
        drafting: bool;
        archivedAt: Date;
        createdAt: Date;
        updatedAt: Date;
    }

    type NewChecklist = Pick<IChecklist, "slug" | "ownerId" | "name" | "description" | "category" | "executionMode">;

    interface IStep {
        content: string;
    }

    interface IChecklistVersion {
        // int8
        id: string;
        // int8
        listId: string;
        version: number;
        steps: IStep[];
        createdAt: Date;
    }

}

export { };

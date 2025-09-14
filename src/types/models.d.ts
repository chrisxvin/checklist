declare global {
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
}

export { };

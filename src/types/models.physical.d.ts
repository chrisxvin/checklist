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

    type NewChecklist = Pick<IChecklist, "slug" | "ownerId" | "name" | "description" | "category" | "icon" | "executionMode">;
    type UpdateChecklist = Pick<IChecklistInstance, "listId" | "verId" | "name" | "description" | "category" | "icon" | "executionMode" | "steps">;

    interface IStep {
        content: string;
        /** 可选，最多 255 字符；纯文本展示（JSONB 中可能为 null） */
        description?: string | null;
        /** 可选，仅用于视觉分组 */
        groupName?: string | null;
        /** 默认 true；自由/顺序模式下能否跳过 */
        isSkippable?: boolean;
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

    /** Run 快照中的步骤 = 模板步骤 + 执行字段 */
    interface IRunStep extends IStep {
        /** true=成功, false=失败, null=未处理或跳过（以 resolvedAt 区分） */
        checked: boolean | null;
        /** 处理/跳过时间；null 表示未处理 */
        resolvedAt: string | null;
        /** 仅跳过时可选的说明 */
        skipReason?: string | null;
    }

    interface IRunInstance {
        // int4
        id: number;
        // int4（checklist.id 为 int8，这里存数值）
        listId: number;
        listVersionId: number;
        listVersion: number;
        status: RUN_STATUS;
        startedBy: number;
        startedAt: Date | null;
        finishedAt: Date | null;
        note?: string;
        steps: IRunStep[];
        meta: Record<string, any> | null;
        // ---- 关联 checklist 的冗余字段（列表/详情展示用）----
        slug?: string;
        name?: string;
        icon?: string;
        executionMode?: EXECUTION_MODE;
        /** 耗时毫秒；由 finishedAt - startedAt 计算，不持久化 */
        durationMs?: number | null;
    }

    interface IRunSummary {
        success: number;
        failure: number;
        skipped: number;
        unresolved: number;
    }

}

export { };

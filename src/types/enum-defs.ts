export const enum EXECUTION_MODE {
    Free = 0,
    Sequential = 1,
    Strict = 2,
};

export const EXECUTION_MODE_MAP = {
    0: "自由",
    1: "顺序",
    2: "严格",
};

export const enum RUN_STATUS {
    NotStarted = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3,
};

export const RUN_STATUS_MAP = {
    0: "未开始",
    1: "进行中",
    2: "已完成",
    3: "已取消",
};

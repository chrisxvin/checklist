# Preflight - 数据库设计

使用 PostgreSQL。所有时间以 UTC 写入 `timestamptz`。用户表统一命名为 `account`；`account`、`checklist`、`checklist_versions` 和 Run 均使用 `int4` 主键。模板步骤和 Run 执行结果均存为有序 `jsonb` 数组。

```sql

-- 账号

CREATE TABLE account (
    uid int4 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username varchar(255) NOT NULL UNIQUE,
    passhash varchar(255),
    email varchar(255) NOT NULL,
    display_name varchar(255) NOT NULL,
    google_id numeric(24,0) UNIQUE,
    picture varchar(255),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_active bool NOT NULL DEFAULT true,
    CHECK (username ~ '^[A-Za-z][A-Za-z0-9\-_]{2,29}$')
);

COMMENT ON COLUMN account.uid IS '账号ID';

COMMENT ON COLUMN account.display_name IS '用户昵称';

COMMENT ON COLUMN account.google_id IS '用 Google 登录绑定的 ID';

COMMENT ON COLUMN account.picture IS '头像URL';

-- 登录会话

CREATE TABLE session (
    sid varchar(255) PRIMARY KEY,
    uid int4 NOT NULL, -- account(uid),
    created_at timestamptz(6) NOT NULL DEFAULT now(),
    expires_at timestamptz(6) NOT NULL
);

COMMENT ON COLUMN session.sid IS '会话ID';

COMMENT ON COLUMN session.uid IS '账号ID';

COMMENT ON COLUMN session.created_at IS '创建时间';

COMMENT ON COLUMN session.expires_at IS '过期时间';

-- 检查单模板

CREATE TABLE checklist (
    id int8 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id int4 NOT NULL,
    slug varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    description varchar(255),
    category varchar(255),
    icon varchar(255),
    current_version integer NOT NULL DEFAULT 1 CHECK (current_version >= 1),
    drafting bool NOT NULL DEFAULT false,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (owner_id, slug)
);

-- 检查单版本

CREATE TABLE checklist_versions (
    id int4 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    list_id int4 NOT NULL,
    version integer NOT NULL CHECK (version >= 1),
    execution_mode int2 NOT NULL DEFAULT 0 CHECK (execution_mode IN (0, 1, 2)),
    steps jsonb NOT NULL CHECK (
        jsonb_typeof(steps) = 'array'
        AND jsonb_array_length(steps) > 0
    ),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (list_id, version)
);

COMMENT ON COLUMN checklist_versions.execution_mode IS '0-free, 1-sequential, 2-strict';

-- 运行记录

CREATE TABLE run_instance (
    id int4 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    list_id int4 NOT NULL, -- checklist(id),
    list_version_id int4 NOT NULL, -- checklist_versions(id),
    list_version integer NOT NULL CHECK (list_version >= 1),
    status int2 NOT NULL DEFAULT 0 CHECK(status IN (0, 1, 2, 3)),
    started_by int4 NOT NULL, -- account(uid),
    started_at timestamptz,
    finished_at timestamptz,
    note varchar(255),
    steps jsonb NOT NULL CHECK (jsonb_typeof(steps) = 'array'),
    -- client_type varchar(255),
    -- client_hostname varchar(255),
    -- client_ip inet,
    -- app_version varchar(255),
    -- latitude numeric(9, 6),
    -- longitude numeric(9, 6),
    meta jsonb CHECK (jsonb_typeof(meta) = 'object'),
    -- CHECK ((started_at IS NULL) = (status = 'not_started')),
    CHECK (finished_at IS NULL OR started_at IS NOT NULL),
    CHECK (finished_at IS NULL OR finished_at >= started_at)
);

COMMENT ON COLUMN run_instance.status IS '0-not_started, 1-in_progress, 2-completed, 3-cancelled';

```

# 数据逻辑

## 模板

### 新建

1. 向 `checklist` 插入基本数据。
2. 向 `checklist_versions` 插入版本数据。

`checklist_versions.steps` 是模板步骤定义数组。每个元素包含 `title`、`description`、`group_name` 和 `is_skippable`。元素顺序决定显示顺序。模板更新提交完整元数据和完整步骤数组；服务端校验数组非空，再插入新的版本记录。已有版本永不更新。

### 读取

关联 `checklist.id = checklist_versions.list_id AND checklist.current_version = checklist_versions.version`，然后提取两个表的数据。

### 编辑

1. 从 `checklist_versions` 根据 `list_id` 和 `version` 读取最新版本，然后提取 `execution_mode`, `steps`。
2. 在 `checklist_versions` 创建新的记录，包括 `list_id`, `version + 1`, `execution_mode`, `steps`.
3. 更新 `checklist`, 写入新的版本号，以及 `updated_at`。

## 运行

1. 根据模板提取最新版本和 steps。
2. 将相关信息写入 run_instance。
3. 用户操作，并更新 run_instance。

`run_instance.steps` 存储 `checklist_versions.steps` 的扩展，新增 `checked`、`resolved_at`、`skip_reason` 等字段。其中 `checked` 字段的含义如下：

    - null: 步骤被跳过
    - true: 成功
    - false: 失败

`run_instance.meta` 存储执行时的一些数据，例如地理位置等。

`run_instance` 创建后 steps 不可重排（客户端控制）。

## 用户

`account` 保存用户数据。

`session` 允许同一个 `uid` 同时存在多条记录，以支持多设备登录。所有“创建 Run + 复制最新版本步骤”、“更新 Run 步骤结果 + 校验执行模式”和“结束 Run + 校验完成条件”必须在一个数据库事务中完成。

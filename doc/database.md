# Preflight - 数据库设计

使用 PostgreSQL。所有时间以 UTC 写入(`timestamptz`类型)。用户表命名为 `account`；`account`、`checklist`、`checklist_version` 和 Run 均使用 `int4` 主键。模板步骤和 Run 执行结果均存为有序 `jsonb` 数组。

```sql

-- 账号

CREATE TABLE account (
    uid int4 PRIMARY KEY GENERATED ALWAYS AS IDENTITY (
INCREMENT 1
MINVALUE  1000
START 1000
CACHE 1
),
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

ALTER TABLE account OWNER TO preflight;

CREATE UNIQUE INDEX idx_account_username ON account (username);
CREATE UNIQUE INDEX idx_account_email ON account (email);

COMMENT ON COLUMN account.uid IS '主键';
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
    execution_mode int2 NOT NULL DEFAULT 0 CHECK (execution_mode IN (0, 1, 2)),
    current_version integer NOT NULL DEFAULT 1 CHECK (current_version >= 1),
    drafting bool NOT NULL DEFAULT true,
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (owner_id, slug)
);

COMMENT ON COLUMN checklist.execution_mode IS '0-free, 1-sequential, 2-strict';

-- 检查单版本

CREATE TABLE checklist_version (
    id int8 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    list_id int8 NOT NULL,
    version integer NOT NULL CHECK (version >= 1),
    steps jsonb NOT NULL CHECK (
        jsonb_typeof(steps) = 'array'
        AND jsonb_array_length(steps) > 0
    ),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (list_id, version)
);

-- 运行记录

CREATE TABLE run_instance (
    id int4 GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    list_id int4 NOT NULL, -- checklist(id),
    list_version_id int4 NOT NULL, -- checklist_version(id),
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


-- View: 

CREATE VIEW checklist_latest AS
    SELECT 
        list.id AS list_id,
        list.slug,
        list.name,
        list.description,
        list.category,
        list.icon,
        list.execution_mode,
        list.current_version,
        list.drafting,
        list.archived_at,
        list.created_at,
        list.updated_at,
        ver.id AS ver_id,
        ver.version,
        ver.steps,
        acct.uid AS owner_id
    FROM checklist list
    JOIN account acct ON acct.uid = list.owner_id
    JOIN checklist_version ver ON list.id = ver.list_id AND list.current_version = ver.version;

```

# 数据逻辑

## 模板

### 新建

1. 向 `checklist` 插入基本数据。
2. 向 `checklist_version` 插入版本数据。

`checklist_version.steps` 是模板步骤定义数组。每个元素包含 `content`（必填）、`description`（可选）、`groupName`（可选，仅视觉分组）和 `isSkippable`（默认 `true`）。元素顺序决定显示顺序。模板更新提交完整元数据和完整步骤数组；服务端校验数组非空。编辑遵循"草稿/定稿"规则（见下），已定稿的版本绝不原地更新。

### 读取

关联 `checklist.id = checklist_version.list_id AND checklist.current_version = checklist_version.version`，然后提取两个表的数据。

### 编辑（草稿 / 定稿）

模板采用两态流程：编辑即进入草稿态（`drafting = true`），草稿期内反复保存都原地更新当前版本，不产生新版本；用户"定稿"（`drafting = false`）后版本冻结，后续编辑才会产生新版本。

1. 从 `checklist_version` 按 `list_id` 与 `checklist.current_version` 读取最新版本，提取 `steps`。
2. 若模板已定稿（`drafting = false`）：复制当前版本 `steps` 插入新记录（`version + 1`），并更新 `checklist` 的 `current_version`、置 `drafting = true`，进入草稿态。
3. 若已在草稿态（`drafting = true`）：原地更新当前版本的 `steps` 与 `checklist` 的元数据（含 `updated_at = now()`），不新增版本。
4. 定稿：仅更新 `checklist.drafting = false`，固化当前版本。

已定稿的版本绝不原地更新；草稿版本可以被反复修改。

## 运行

1. 根据模板提取最新版本和 steps。
2. 将相关信息写入 run_instance。
3. 用户操作，并更新 run_instance。

`run_instance.steps` 存储 `checklist_version.steps` 的扩展，新增 `checked`、`resolved_at`、`skip_reason` 等字段。其中 `checked` 字段的含义如下：

    - null: 步骤被跳过
    - true: 成功
    - false: 失败

`run_instance.meta` 存储执行时的一些数据，例如地理位置等。

`run_instance` 创建后 steps 不可重排（客户端控制）。

## 用户

`account` 保存用户数据。登录支持两种方式：Google OAuth（`google_id` 绑定）与用户名密码（`passhash` 保存客户端 SHA-256 后的 64 位 hex 哈希，服务端只做哈希比对，不接触明文密码）。

`session` 允许同一个 `uid` 同时存在多条记录，以支持多设备登录。所有“创建 Run + 复制最新版本步骤”、“更新 Run 步骤结果 + 校验执行模式”和“结束 Run + 校验完成条件”必须在一个数据库事务中完成。

# Preflight - 数据库设计

使用 PostgreSQL。所有时间以 UTC 写入 `timestamptz`；用户、Checklist、版本和 Run 使用 UUID。步骤使用每表独立的 `bigint` 流水 ID，`sort_id` 专门表示同一父记录内的显示顺序。

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 用户

CREATE TABLE account (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    google_subject text NOT NULL UNIQUE,
    username text NOT NULL UNIQUE,
    email text NOT NULL,
    display_name text,
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (username ~ '^[A-Za-z][A-Za-z0-9-]{2,29}$')
);

CREATE TABLE checklists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES account(id),
    slug text NOT NULL,
    name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
    description text CHECK (char_length(description) <= 2000),
    category text,
    icon text,
    execution_mode text NOT NULL DEFAULT 'normal'
        CHECK (execution_mode IN ('normal', 'sequential')),
    current_version integer NOT NULL DEFAULT 1 CHECK (current_version >= 1),
    archived_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (owner_id, slug)
);

CREATE TABLE checklist_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id uuid NOT NULL REFERENCES checklists(id),
    version integer NOT NULL CHECK (version >= 1),
    name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
    description text CHECK (char_length(description) <= 2000),
    category text,
    icon text,
    execution_mode text NOT NULL CHECK (execution_mode IN ('normal', 'sequential')),
    created_by uuid NOT NULL REFERENCES account(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (checklist_id, version)
);

CREATE TABLE checklist_version_steps (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    checklist_version_id uuid NOT NULL REFERENCES checklist_versions(id),
    sort_id integer NOT NULL CHECK (sort_id >= 1),
    title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    description text CHECK (char_length(description) <= 5000),
    group_name text,
    is_skippable boolean NOT NULL DEFAULT true,
    is_optional boolean NOT NULL DEFAULT false,
    UNIQUE (checklist_version_id, sort_id)
);

CREATE TABLE runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id uuid NOT NULL REFERENCES checklists(id),
    checklist_version_id uuid NOT NULL REFERENCES checklist_versions(id),
    template_version integer NOT NULL CHECK (template_version >= 1),
    status text NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
    started_by uuid NOT NULL REFERENCES account(id),
    started_at timestamptz,
    ended_at timestamptz,
    note text,
    client_type text,
    client_hostname text,
    client_ip inet,
    app_version text,
    latitude numeric(9, 6),
    longitude numeric(9, 6),
    CHECK ((started_at IS NULL) = (status = 'not_started')),
    CHECK (ended_at IS NULL OR started_at IS NOT NULL),
    CHECK (ended_at IS NULL OR ended_at >= started_at)
);

CREATE TABLE run_steps (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id uuid NOT NULL REFERENCES runs(id),
    source_version_step_id bigint NOT NULL REFERENCES checklist_version_steps(id),
    sort_id integer NOT NULL CHECK (sort_id >= 1),
    title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    description text CHECK (char_length(description) <= 5000),
    group_name text,
    is_skippable boolean NOT NULL,
    is_optional boolean NOT NULL,
    status text NOT NULL DEFAULT 'unchecked' CHECK (status IN ('unchecked', 'checked', 'skipped')),
    resolved_at timestamptz,
    resolved_by uuid REFERENCES account(id),
    note text,
    latitude numeric(9, 6),
    longitude numeric(9, 6),
    UNIQUE (run_id, sort_id),
    CHECK ((status = 'unchecked') = (resolved_at IS NULL)),
    CHECK ((status = 'unchecked') = (resolved_by IS NULL))
);

CREATE INDEX checklists_owner_active_updated_idx
    ON checklists (owner_id, archived_at, updated_at DESC);

CREATE INDEX checklist_versions_checklist_created_idx
    ON checklist_versions (checklist_id, created_at DESC);

CREATE INDEX checklist_version_steps_version_sort_idx
    ON checklist_version_steps (checklist_version_id, sort_id);

CREATE INDEX runs_checklist_started_idx
    ON runs (checklist_id, started_at DESC);

CREATE INDEX runs_started_by_status_started_idx
    ON runs (started_by, status, started_at DESC);

CREATE INDEX run_steps_run_sort_idx
    ON run_steps (run_id, sort_id);
```

`id` 只用于稳定引用和追踪创建顺序；展示和执行一律按 `sort_id`。`sort_id` 在保存模板时按拖拽后的顺序重新连续编号，Run 创建时原样复制。数据库约束保证同一版本或 Run 内不会有重复排序值；连续性及顺序模式规则由保存模板和创建 Run 的事务校验。

所有“创建 Run + 复制步骤”、“更新步骤状态 + 校验顺序”和“结束 Run + 校验完成条件”必须在一个数据库事务中完成。

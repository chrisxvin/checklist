# Preflight - 功能设计

## 1. 核心概念

| 概念 | 含义 | 是否可变 |
| --- | --- | --- |
| Checklist | 模板的稳定身份与当前展示信息。 | 可变 |
| Checklist Version | 一次保存后的完整模板快照。 | 不可变 |
| Checklist Version Step | 某个模板版本中的文本步骤定义。 | 不可变 |
| Run | 用户对一个模板版本发起的一次执行。 | 状态和备注可变，结束后冻结 |
| Run Step | 创建 Run 时复制出的步骤及执行结果。 | 完成前可变，结束后冻结 |

```text
Checklist 1 -- * ChecklistVersion 1 -- * ChecklistVersionStep
                              |
                              * -- Run 1 -- * RunStep
```

RunStep 必须保存标题、描述、排序、分组、可跳过和可选标记的副本。模板被编辑或归档后，历史 Run 仍能准确呈现当时内容。

## 2. 用户与权限

- 首页对未登录用户显示产品介绍和 Google 登录入口；受保护页面跳转至登录页。
- Google 登录是唯一身份提供方；一个 Google `sub` 对应一个本地用户。
- 用户只能读取或修改自己的 Checklist 和 Run。服务端必须从会话取得用户身份，不信任客户端提交的用户 ID 或审计字段。
- 用户名是公开 URL 标识，创建后不可变；同一用户名只对应一个用户。

## 3. Checklist 模板

### 元数据

| 字段 | 规则 |
| --- | --- |
| `slug` | 用户范围内唯一；用于 URL，名称变更不自动修改 |
| `name` | 必填，1-120 个字符 |
| `description` | 可选，最多 2,000 字符 |
| `category` | 可选单个文本分类 |
| `icon` | 可选 Iconify 图标名 |
| `execution_mode` | `normal` 或 `sequential`，默认 `normal` |
| `archived_at` | 非空表示归档；不可新建 Run，历史仍可查看 |

每次创建或保存模板，服务端创建一个完整的 ChecklistVersion 和步骤集合；旧版本永不修改。即使只改模板名称或描述，也创建新版本，使每个 Run 都能指向一次明确保存的模板状态。

### 文本步骤与拖拽排序

步骤只包含文本内容，不提供图片、文件或其他附件功能。

| 字段 | 规则 |
| --- | --- |
| `id` | 步骤流水 ID；创建后永不改变，不表达展示顺序 |
| `sort_id` | 同一 ChecklistVersion 或 Run 内的排序 ID；决定显示和执行顺序 |
| `title` | 必填，1-200 个字符 |
| `description` | 可选，最多 5,000 字符；Markdown 以纯文本存储，渲染时消毒 |
| `group_name` | 可选，仅用于视觉分组，不影响完成逻辑 |
| `is_skippable` | 默认 `true`；顺序模式强制为 `false` |
| `is_optional` | 默认 `false`；不计入完成率，也不阻止完成 |

编辑器支持通过拖拽排序。保存时以 `sort_id` 写入最终顺序；每个版本内从 `1` 连续编号，不重复。拖拽排序不得重建步骤或改变既有步骤的 `id`。Run 创建时复制源步骤的 `sort_id`，其步骤顺序之后不再因模板编辑而变化。

保存模板时校验：至少一个步骤；`sort_id` 不重复且连续；顺序模式不存在可跳过步骤。

## 4. Run 状态与执行规则

### Run 状态

```text
not_started -- start --> in_progress -- complete --> completed
      |                       |
      +------ cancel ---------+-- cancel -------> cancelled
```

首版点击“开始执行”时直接创建 `in_progress` Run 并设置 `started_at`。结束时设置 `ended_at`；耗时由两者计算，不持久化。

RunStep 的 `status` 取值：

- `unchecked`：未处理，默认值；
- `checked`：已完成；
- `skipped`：已跳过，仅非顺序模式中 `is_skippable = true` 的步骤可设置。

状态变为 `checked` 或 `skipped` 时，写入 `resolved_at` 和 `resolved_by`。恢复为 `unchecked` 时清空这两个字段和该次处理备注。仅进行中的 Run 可更新。

### 执行模式

- 普通模式可按任意顺序更新步骤；允许跳过的步骤可跳过。
- 顺序模式只能处理当前 `sort_id` 最小的未处理步骤，且不显示跳过操作。
- 可选步骤不参与完成条件；在顺序模式中不阻塞后续必填步骤。

完成条件为所有非可选步骤都不再是 `unchecked`，且没有违反执行模式的状态。服务端在状态变更与完成请求时校验。

## 5. 页面与交互

所有登录用户相关页面均位于 `/u/[username]/` 下，服务端必须验证路径中的 `username` 与当前会话用户一致。

| 路由 | 目的 | 主要内容 |
| --- | --- | --- |
| `/` | 首页 | 未登录时显示介绍和登录；登录后跳转至用户模板库 |
| `/u/[username]/` | 模板库 | 活跃模板、搜索、分类筛选、新建模板 |
| `/u/[username]/checklists/new` | 新建模板 | 元数据、模式、可拖拽步骤编辑器 |
| `/u/[username]/checklists/[slug]` | 模板详情 | 当前版本步骤、最近 Run、开始执行、编辑、归档 |
| `/u/[username]/checklists/[slug]/edit` | 编辑模板 | 当前版本副本；保存创建新版本 |
| `/u/[username]/checklists/[slug]/history` | 模板历史 | 按开始时间倒序，状态、日期和关键词筛选 |
| `/u/[username]/runs/[id]` | 执行页和 Run 详情 | 进行中时更新步骤、备注、取消、完成；结束后只读 |
| `/u/[username]/runs` | 全部历史 | 当前用户所有 Run，支持模板、状态和日期筛选 |

关键交互：

1. 开始执行立即创建新 Run 并进入对应执行页；重复点击不会复用旧 Run。
2. 勾选、跳过和填写备注均立即保存；失败时保留本地输入并允许重试。
3. 完成前显示未处理必填项数量；只有服务端校验通过才能完成。
4. 取消需要二次确认，并保留已处理步骤和备注。
5. 历史项显示开始日期、状态、耗时、完成数/必填数和模板版本；详情显示“基于模板 vN”。

## 6. 服务端边界

SvelteKit 页面使用 server load/actions，不为页面重复建设 REST 层。若开放 HTTP API，资源语义如下：

| 操作 | 动作 |
| --- | --- |
| 列表、创建模板 | `GET/POST /u/:username/checklists` |
| 读取、编辑、归档模板 | `GET/PATCH /u/:username/checklists/:slug`、`POST /u/:username/checklists/:slug/archive` |
| 开始 Run | `POST /u/:username/checklists/:slug/runs` |
| 读取、更新 Run 备注 | `GET/PATCH /u/:username/runs/:id` |
| 更新步骤结果 | `PATCH /u/:username/runs/:id/steps/:stepId` |
| 完成或取消 Run | `POST /u/:username/runs/:id/complete`、`POST /u/:username/runs/:id/cancel` |
| 查询历史 | `GET /u/:username/runs?checklist=&status=&from=&to=&q=&cursor=` |

列表使用游标分页，默认按 `started_at DESC`。所有写操作从会话取得用户 ID；“创建 Run 并复制步骤”、“更新步骤状态并校验顺序”和“结束 Run 并校验完成条件”必须在一个事务中完成。

## 7. 审计、隐私与安全

- 自动记录开始/结束时间、执行人、客户端类型和应用版本。IP 由服务端取得；主机名和 GPS 仅在客户端授权后提交，缺失时为 `NULL`。
- Markdown 仅使用受信任的消毒渲染器输出，禁止原样插入 HTML。
- 完成或取消后的 Run 及其步骤不可更新；归档模板不删除历史。

## 8. 验收标准

1. 创建包含必填、可跳过、可选步骤的模板，模板详情正确显示。
2. 编辑器拖拽步骤后，保存的 `sort_id` 正确、连续，既有步骤 `id` 不变。
3. 编辑模板生成 v2；以 v1 开始的 Run 仍显示 v1 的标题、步骤和 `sort_id`。
4. 普通模式允许处理任意步骤，且只允许跳过 `is_skippable` 步骤。
5. 顺序模式只能处理当前首个未处理步骤，且无法跳过。
6. 未处理必填步骤阻止完成；可选步骤不阻止完成。
7. 已完成或取消的 Run 无法再通过服务端更新步骤、备注或状态。
8. 用户 A 无法读取、编辑、开始或更新用户 B 的 Checklist 和 Run。
9. 历史列表能按状态、日期和关键词筛选，并显示正确耗时与模板版本。

## 9. 实施顺序

1. 建立 PostgreSQL 适配器、迁移与用户会话边界。验证：迁移可重复执行，用户隔离测试通过。
2. 实现 Checklist、版本和可拖拽步骤编辑。验证：编辑生成新版本，`id` 稳定且 `sort_id` 正确。
3. 实现 Run 物化、状态机和执行页。验证：Run 快照、顺序限制和完成条件通过。
4. 实现模板库、历史和搜索筛选。验证：用户隔离和历史筛选通过。

当前代码仍有 MongoDB 风格的 `db.templates` / `ObjectId` 调用；实现第 1 步时应以 PostgreSQL 适配器替换这些 Checklist 读取路径，而不是在同一业务流中维护两套数据源。

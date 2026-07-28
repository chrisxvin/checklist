# Preflight - 日常检查清单

Preflight 用于把可重复的工作固化为检查单模板，并为每一次执行保留独立、可追溯的执行记录。模板后续修改不会改变已创建 Run 中的步骤内容。

当前版本提供：

- Google 登录、多设备 session 与按用户隔离的数据访问；
- List Template 模板的新建、编辑、归档与版本保存；
- 仅文本 Checkbox 步骤，支持拖拽排序和可跳过标记；
- 从模板发起 Run，记录逐项结果、备注、开始和结束时间；
- 模板库、模板历史和全部执行历史的搜索与筛选。

详细功能、页面和验收标准见 [features.md](features.md)。数据库表、约束和索引 SQL 见 [database.md](database.md)。

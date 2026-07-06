# Codex Fixbook — 总体架构设计

> 一个以「症状」为索引的 Codex CLI/App 故障排查知识库。
> 核心资产是结构化的 fix 数据，GitHub repo 是仓储，本地 Agent skill 是主要分发形态，Pages 站点和 JSON 是辅助分发。
> 零后端：GitHub Issue Forms 收投稿，Actions 做流水线,Pages 做前端。

---

## 1. 核心设计原则

1. **以症状为索引，不以 issue 为索引。** 用户带着「Codex 卡住了/响应超时/MCP 工具不见了」这样的症状来搜，页面按症状组织，每个症状下列出多个已知原因（cause）及各自的解决方案。
2. **人肉投稿为主，自动化为辅。** 最有价值的 fix（如「stitch MCP 初始化卡死整个 app」）往往不存在于官方 issue 区，只能靠社区投稿。自动化只负责脏活：版本比对、去重提示、格式化、建站。
3. **所有条目带版本标注。** Codex 发版极快，不带 `affects_versions / fixed_in` 的条目三周后就是误导。
4. **每条 fix = 一条可被 skill 精确匹配的结构化知识。** 页面标题仍包含错误信息原文（长尾 SEO），但 V1 优先服务本地 Agent skill 的症状匹配和可执行排查。
5. **人工 gate。** 一切自动化产出（投稿转换、changelog 标记）都以 PR 形式提交，维护者 merge 才生效，防止退化成第二个 issue 区。

## 2. 数据模型（repo 的核心）

所有数据是 repo 内的 YAML 文件，git 即数据库。

```
data/
  symptoms/          # 症状（索引单元）
    app-hangs-or-slow.yaml
  causes/            # 原因+解法（内容单元），多对多挂到症状上
    stitch-mcp-init-blocks-app.yaml
```

**symptom 示例：**

```yaml
id: app-hangs-or-slow
title_en: "Codex app hangs, responds slowly, or times out"
title_zh: "Codex app 卡住、响应缓慢或超时"
surfaces: [app, cli]          # 影响面：cli / app / ide / cloud
search_keywords:              # 用户可能搜的原话，用于站内搜索和 SEO
  - "codex timeout"
  - "codex 响应慢"
cause_ids: [stitch-mcp-init-blocks-app, ...]
```

**cause 示例：**

```yaml
id: stitch-mcp-init-blocks-app
title_en: "A third-party MCP server hangs during initialization, blocking the whole app"
title_zh: "第三方 MCP server 初始化挂起，卡死整个 app"
status: active                # active / fixed / partially-fixed
affects_versions: ">=0.130 <=?"   # 已确认受影响的版本范围，未知用 ?
fixed_in: null                # 官方修复版本号，null = 尚未修复
known_offenders: [stitch]     # 已知肇事 MCP server 名单（本条目特有字段，可选）
diagnosis_zh: |               # 如何确认自己是这个原因（诊断步骤）
  运行 codex 时逐个禁用 MCP server，观察是否恢复……
workaround_zh: |              # 解决方案 / 临时绕过
  在 config.toml 中禁用该 MCP server……
diagnosis_en: ...
workaround_en: ...
sources:                      # 出处链接：issue、LinuxDo、博客等
  - https://linux.do/t/xxxxx
verified_by: [chase]          # 谁验证过（投稿人 GitHub id）
last_verified: 2026-07-05
last_verified_codex_version: "0.140.0"
```

## 3. 三条流水线（GitHub Actions）

### Pipeline A：投稿 → PR（触发：issue 打上 `submission` label）
1. 投稿人通过 **GitHub Issue Form**（结构化表单：症状、Codex 版本、诊断过程、解法、出处链接）提交。
2. Action 解析表单 → 调 LLM API（DeepSeek）做两件事：
   - 与现有 causes 做语义去重，重复则在 issue 下评论提示并关联已有条目；
   - 不重复则生成规范化的 YAML 草稿。
3. 自动开一个 PR（新增/修改 YAML），关联原 issue。维护者 review 后 merge，issue 自动关闭。

### Pipeline B：changelog 巡检（触发：cron，每日）
1. 抓取 openai/codex 的 releases/changelog。
2. LLM 将 release notes 与库内 `status: active` 的 causes 比对。
3. 疑似已修复的条目 → 开 PR 更新 `fixed_in` 和 `status`，PR 描述中引用 changelog 原文供人工确认。

### Pipeline C：建站（触发：push to main）
1. 静态站点生成器（Astro 或极简自写脚本均可，Codex 自行选型）读取 YAML → 生成 Pages 站点。
2. 页面结构：首页(按 surface 分类的症状列表 + 客户端搜索) → 症状页 → 原因详情页。
3. 每个原因页 `<title>` 包含错误信息/症状原文，中英双语（`/en/` 与 `/zh/` 路径）。
4. 同时输出机器可读产物：`known-issues.json`（全量数据），供 skill、agent 和第三方工具消费。

## 4. Repo 结构

```
/
├── data/                  # symptoms + causes YAML（核心资产）
├── skills/                # Agent skill 入口与使用说明
├── site/                  # 静态站点源码
├── scripts/               # 数据校验、JSON 生成与 pipeline 脚本
├── .github/
│   ├── ISSUE_TEMPLATE/    # submission 用 Issue Form（YAML 定义）
│   └── workflows/         # submit.yml / changelog-patrol.yml / deploy.yml
├── schema/                # symptom/cause 的 JSON Schema，CI 校验数据合法性
└── README.md              # 中英双语，讲清楚项目定位 + stitch 案例作为开场故事
```

## 5. 边界与不做的事（V1）

- **只覆盖 Codex CLI 与 Codex app（桌面端）**，不碰 IDE 扩展和 Cloud。
- **不做后端、不做数据库、不做账号系统。** 一切状态在 git 里。
- **不全量抓取官方 issue 区。** 自动化不生产内容，只辅助（去重、版本巡检、格式化）。
- 首批内容目标：**10–20 条高质量、已验证的 cause**（含 stitch 案例），宁缺毋滥。
- LLM 调用统一封装成一个模块，密钥走 repo secrets，单次失败不阻塞流水线（降级为纯人工处理）。

## 6. 实施顺序建议（给 Codex 的任务拆分）

1. 定 JSON Schema + 写入 stitch 案例作为第一条种子数据。
2. Pipeline C（建站），先让站点跑起来 → 项目立刻可见、可分享。
3. Issue Form + Pipeline A（投稿转 PR），先不接 LLM 去重，跑通纯格式转换。
4. Pipeline B（changelog 巡检）+ 给 Pipeline A 补上 LLM 去重。
5. 打磨 skill 使用体验、SEO（meta、sitemap）与 `known-issues.json` 输出。

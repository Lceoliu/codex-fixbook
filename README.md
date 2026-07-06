# Codex Fixbook

Codex Fixbook is a symptom-indexed troubleshooting knowledge base for Codex CLI and the Codex desktop app.

Instead of indexing by GitHub issue number, it starts from what users actually see: hangs, timeouts, missing tools, MCP startup failures, or repeated errors. Each fix is stored as structured YAML, reviewed through pull requests, and packaged primarily as a local Agent skill, with the static site and machine-readable JSON kept as supporting distribution formats.

## Quick start

```powershell
# Windows PowerShell: keep UTF-8 output readable
[Console]::InputEncoding=[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new()

npm ci --cache .\.npm-cache --prefer-offline
npm run validate
npm run build
npm run dev
```

Open the local URL printed by Astro. The main pages are:

- `/zh/` Chinese symptom index
- `/en/` English symptom index
- `/known-issues.json` machine-readable full dataset

## Use as an Agent Skill

Codex Fixbook is designed to be used as a local troubleshooting skill first. Install or reference `skills/codex-fixbook/SKILL.md` in your Agent so it can match user-visible Codex symptoms against the verified YAML dataset. The static site and `public/known-issues.json` are generated views of the same source data for browsing and fallback integrations.

## Data model

Core data lives in `data/`:

```text
data/
  symptoms/
    app-hangs-or-slow.yaml
  causes/
    stitch-mcp-init-blocks-app.yaml
```

A symptom is the index unit. A cause is the content unit and can be linked from one or more symptoms.

Required symptom fields:

- `id`
- `title_en`
- `title_zh`
- `surfaces`
- `search_keywords`
- `cause_ids`

Required cause fields:

- `id`
- `title_en`
- `title_zh`
- `status`: `active`, `fixed`, or `partially-fixed`
- `platforms`: any of `macos`, `windows`, `wsl`, `linux`
- `affects_versions`
- `fixed_in`
- `diagnosis_zh`, `workaround_zh`
- `diagnosis_en`, `workaround_en`
- `sources`
- `verified_by`
- `last_verified`
- `last_verified_codex_version`

Run `npm run validate` before opening a PR.

## Contributing a fix

Use the GitHub issue form **Submit a Codex fix** and include:

1. The affected surface: Codex app, CLI, or both.
2. The platform where you verified it: macOS, Windows, WSL, or Linux.
3. The Codex version you verified.
4. The exact symptom or error text.
5. Diagnosis steps that distinguish this from similar failures.
6. A workaround or fix another user can apply.
7. Source links: issues, forum threads, changelog notes, or repro notes.

V1 uses human maintainer review as the gate. Automation may format data or suggest duplicates, but merged YAML remains the source of truth.

---

# Codex Fixbook（中文）

Codex Fixbook 是一个以“症状”为索引的 Codex CLI / Codex 桌面端故障排查知识库。

用户通常不是带着 issue 编号来搜索，而是带着“Codex 卡住了”“响应超时”“MCP 工具不见了”这类症状来搜索。因此本项目把内容拆成：症状、原因、解决方案、影响版本和验证记录。

## 本地运行

```powershell
[Console]::InputEncoding=[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new()

npm ci --cache .\.npm-cache --prefer-offline
npm run validate
npm run build
npm run dev
```

主要入口：

- `/zh/` 中文症状索引
- `/en/` 英文症状索引
- `/known-issues.json` 机器可读全量数据

## 作为 Agent Skill 使用

Codex Fixbook 优先做成本地故障排查 skill。Agent 应安装或引用 `skills/codex-fixbook/SKILL.md`，再用 YAML 数据匹配用户可见的 Codex 症状。静态站点和 `public/known-issues.json` 是同一份源数据的浏览和 fallback 产物。

## 当前内置案例

当前仓库从 `stitch-mcp-init-blocks-app` 起步，并继续补充了 MCP 启动/工具发现超时、Windows PowerShell UTF-8 乱码、无头环境登录、apply_patch 调用失败、Codex Desktop 登录卡住、代理缺失导致新对话反复重连等常见症状。

这些案例展示了 V1 的内容原则：

- 先描述用户能观察到的症状。
- 再描述如何确认具体原因。
- 最后给出可执行的临时绕过方案。
- 每条原因都标注平台、影响版本、验证人、最后验证日期和来源链接。

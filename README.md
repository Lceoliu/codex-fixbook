# Codex Fixbook

Codex Fixbook is a symptom-indexed troubleshooting knowledge base for Codex CLI and the Codex desktop app. It is packaged primarily as a local Agent skill: the static site and `known-issues.json` are generated views of the same verified YAML data.

- Site: [https://lceoliu.github.io/codex-fixbook/](https://lceoliu.github.io/codex-fixbook/)
- Chinese index: [https://lceoliu.github.io/codex-fixbook/zh/](https://lceoliu.github.io/codex-fixbook/zh/)
- English index: [https://lceoliu.github.io/codex-fixbook/en/](https://lceoliu.github.io/codex-fixbook/en/)
- Machine-readable data: [known-issues.json](https://lceoliu.github.io/codex-fixbook/known-issues.json)
- Submit a fix: [GitHub Issue Form](https://github.com/Lceoliu/codex-fixbook/issues/new?template=fix-submission.yml)
- Skill entrypoint: [`skills/codex-fixbook/SKILL.md`](https://github.com/Lceoliu/codex-fixbook/blob/main/skills/codex-fixbook/SKILL.md)

## Install with Codex

Send this prompt to Codex or another local Agent that can install skills:

```text
请从 https://github.com/Lceoliu/codex-fixbook.git 安装 Codex Fixbook skill。

请执行以下事项：
1. clone 仓库到一个稳定的本地目录，例如 macOS/Linux 的 ~/skills/codex-fixbook，或 Windows 的 %USERPROFILE%\skills\codex-fixbook。
2. 确认仓库内存在 skills/codex-fixbook/SKILL.md。
3. 检查当前 Codex/Agent 的本地 skill 目录；如果没有更具体的项目约定，优先使用 ~/.agents/skills/codex-fixbook（Windows 对应 %USERPROFILE%\.agents\skills\codex-fixbook）。
4. 将仓库里的 skills/codex-fixbook 复制或链接到该本地 skill 目录。
5. 在仓库根目录运行 npm ci 和 npm run validate，确认 YAML 数据可以被校验。
6. 安装完成后，告诉我 skill 的实际安装路径，以及是否需要开启一个新对话来加载这个 skill。

安装后，当我描述 Codex CLI 或 Codex Desktop 卡住、超时、MCP 工具缺失、登录失败、代理/reconnecting、apply_patch 失败等问题时，请优先使用 Codex Fixbook 的 skill 和 known-issues.json 来匹配症状、诊断原因并给出 workaround。不要编造未验证的平台、版本、fixed_in 或来源链接。
```

## What it covers

Instead of indexing by GitHub issue number, Codex Fixbook starts from what users actually see: hangs, timeouts, missing tools, MCP startup failures, repeated reconnects, login failures, proxy issues, and patch-tool errors.

Current entries cover common cases such as:

- MCP startup and `tools/list` timeouts.
- Windows PowerShell UTF-8 mojibake.
- Headless / SSH login failures.
- `apply_patch` command or sandbox failures.
- Codex Desktop login failures.
- Codex Desktop reconnect loops caused by missing proxy environment.

## Local development

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

Use [Submit a Codex fix](https://github.com/Lceoliu/codex-fixbook/issues/new?template=fix-submission.yml) and include:

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

Codex Fixbook 是一个以“症状”为索引的 Codex CLI / Codex 桌面端故障排查知识库。项目优先作为本地 Agent skill 使用；静态站点和 `known-issues.json` 是同一份 YAML 数据的浏览和 fallback 产物。

- 站点：[https://lceoliu.github.io/codex-fixbook/](https://lceoliu.github.io/codex-fixbook/)
- 中文索引：[https://lceoliu.github.io/codex-fixbook/zh/](https://lceoliu.github.io/codex-fixbook/zh/)
- 英文索引：[https://lceoliu.github.io/codex-fixbook/en/](https://lceoliu.github.io/codex-fixbook/en/)
- 机器可读数据：[known-issues.json](https://lceoliu.github.io/codex-fixbook/known-issues.json)
- 提交修复：[GitHub Issue Form](https://github.com/Lceoliu/codex-fixbook/issues/new?template=fix-submission.yml)
- Skill 入口：[`skills/codex-fixbook/SKILL.md`](https://github.com/Lceoliu/codex-fixbook/blob/main/skills/codex-fixbook/SKILL.md)

## 让 Codex 自动安装

把下面这段发给 Codex：

```text
请从 https://github.com/Lceoliu/codex-fixbook.git 安装 Codex Fixbook skill。

请执行以下事项：
1. clone 仓库到一个稳定的本地目录，例如 macOS/Linux 的 ~/skills/codex-fixbook，或 Windows 的 %USERPROFILE%\skills\codex-fixbook。
2. 确认仓库内存在 skills/codex-fixbook/SKILL.md。
3. 检查当前 Codex/Agent 的本地 skill 目录；如果没有更具体的项目约定，优先使用 ~/.agents/skills/codex-fixbook（Windows 对应 %USERPROFILE%\.agents\skills\codex-fixbook）。
4. 将仓库里的 skills/codex-fixbook 复制或链接到该本地 skill 目录。
5. 在仓库根目录运行 npm ci 和 npm run validate，确认 YAML 数据可以被校验。
6. 安装完成后，告诉我 skill 的实际安装路径，以及是否需要开启一个新对话来加载这个 skill。

安装后，当我描述 Codex CLI 或 Codex Desktop 卡住、超时、MCP 工具缺失、登录失败、代理/reconnecting、apply_patch 失败等问题时，请优先使用 Codex Fixbook 的 skill 和 known-issues.json 来匹配症状、诊断原因并给出 workaround。不要编造未验证的平台、版本、fixed_in 或来源链接。
```

## 当前内置案例

当前仓库从 `stitch-mcp-init-blocks-app` 起步，并继续补充了 MCP 启动/工具发现超时、Windows PowerShell UTF-8 乱码、无头环境登录、apply_patch 调用失败、Codex Desktop 登录卡住、代理缺失导致新对话反复重连等常见症状。

这些案例展示了 V1 的内容原则：

- 先描述用户能观察到的症状。
- 再描述如何确认具体原因。
- 最后给出可执行的临时绕过方案。
- 每条原因都标注平台、影响版本、验证人、最后验证日期和来源链接。

## 本地开发

```powershell
[Console]::InputEncoding=[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new()

npm ci --cache .\.npm-cache --prefer-offline
npm run validate
npm run build
npm run dev
```

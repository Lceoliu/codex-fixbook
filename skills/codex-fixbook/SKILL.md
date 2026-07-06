---
name: codex-fixbook
description: Use this skill when a user reports Codex CLI or Codex desktop app failures such as hangs, timeouts, missing MCP tools, or MCP initialization problems.
---

# Codex Fixbook

Use this repository as a local troubleshooting knowledge base for Codex CLI and the Codex desktop app.

## Data sources

1. Prefer `public/known-issues.json` when it exists.
2. If the generated JSON is missing or stale, read:
   - `data/symptoms/*.yaml`
   - `data/causes/*.yaml`
3. Treat YAML in `data/` as the source of truth.

## How to answer

When the user reports a Codex problem:

1. Match the report against symptom titles, search keywords, known offenders, and cause text.
2. Return the most likely cause first.
3. Include affected platforms and versions, fixed version if known, diagnosis steps, workaround, and source links.
4. Do not invent `platforms`, `affects_versions`, `fixed_in`, verification status, or source links.
5. If there is no match, say that Codex Fixbook does not have a verified entry yet and suggest submitting a GitHub Issue Form with:
   - visible symptom or exact error text
   - platform (macOS, Windows, WSL, or Linux)
   - Codex version
   - diagnosis steps
   - workaround or fix
   - source links

## Boundaries

- V1 covers Codex CLI and the Codex desktop app.
- Do not treat unverified reports as fixed entries.
- Keep the answer symptom-first, practical, and platform- and version-aware.

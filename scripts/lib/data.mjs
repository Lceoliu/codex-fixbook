import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";
import * as yaml from "js-yaml";

export const SURFACE_LABELS = {
  zh: { app: "Codex app", cli: "Codex CLI", ide: "IDE 扩展", cloud: "Codex Cloud" },
  en: { app: "Codex app", cli: "Codex CLI", ide: "IDE extension", cloud: "Codex Cloud" }
};

export const STATUS_LABELS = {
  zh: { active: "未修复", fixed: "已修复", "partially-fixed": "部分修复" },
  en: { active: "Open", fixed: "Fixed", "partially-fixed": "Partially fixed" }
};

export const PLATFORM_LABELS = {
  macos: "macOS",
  windows: "Windows",
  wsl: "WSL",
  linux: "Linux"
};

function repoPath(...parts) {
  return path.join(process.cwd(), ...parts);
}

async function readYamlDir(relativeDir) {
  const pattern = path.join(relativeDir, "*.yaml").replace(/\\/g, "/");
  const files = await fg(pattern, { cwd: process.cwd(), absolute: true, onlyFiles: true });
  const items = [];
  for (const file of files.sort()) {
    const raw = await fs.readFile(file, "utf8");
    const item = yaml.load(raw);
    items.push({ ...item, __file: path.relative(process.cwd(), file).replace(/\\/g, "/") });
  }
  return items;
}

export async function loadFixbook() {
  const [symptoms, causes] = await Promise.all([
    readYamlDir("data/symptoms"),
    readYamlDir("data/causes")
  ]);
  const causeById = new Map(causes.map((cause) => [cause.id, cause]));
  const symptomsWithCauses = symptoms.map((symptom) => ({
    ...symptom,
    causes: symptom.cause_ids.map((id) => causeById.get(id)).filter(Boolean)
  }));
  return { symptoms: symptomsWithCauses, causes, causeById };
}

export async function readJson(relativePath) {
  const raw = await fs.readFile(repoPath(relativePath), "utf8");
  return JSON.parse(raw);
}

export function titleOf(item, lang) {
  return item[`title_${lang}`] ?? item.title_en ?? item.id;
}

export function bodyOf(item, field, lang) {
  return item[`${field}_${lang}`] ?? item[`${field}_en`] ?? "";
}

export function statusLabel(status, lang) {
  return STATUS_LABELS[lang]?.[status] ?? status;
}

export function surfaceLabel(surface, lang) {
  return SURFACE_LABELS[lang]?.[surface] ?? surface;
}

export function platformLabel(platform) {
  return PLATFORM_LABELS[platform] ?? platform;
}

export function causeSummary(cause, lang = "en") {
  return {
    id: cause.id,
    title: titleOf(cause, lang),
    status: cause.status,
    platforms: cause.platforms ?? [],
    affects_versions: cause.affects_versions,
    fixed_in: cause.fixed_in,
    known_offenders: cause.known_offenders ?? [],
    last_verified: cause.last_verified,
    last_verified_codex_version: cause.last_verified_codex_version
  };
}

export function normalizedKnownIssues(data) {
  return {
    generated_at: new Date().toISOString(),
    schema_version: "0.2.0",
    symptoms: data.symptoms.map((symptom) => ({
      id: symptom.id,
      title_en: symptom.title_en,
      title_zh: symptom.title_zh,
      surfaces: symptom.surfaces,
      search_keywords: symptom.search_keywords,
      cause_ids: symptom.cause_ids,
      causes: symptom.causes.map((cause) => causeSummary(cause, "en"))
    })),
    causes: data.causes.map((cause) => ({
      id: cause.id,
      title_en: cause.title_en,
      title_zh: cause.title_zh,
      status: cause.status,
      platforms: cause.platforms ?? [],
      affects_versions: cause.affects_versions,
      fixed_in: cause.fixed_in,
      known_offenders: cause.known_offenders ?? [],
      diagnosis_zh: cause.diagnosis_zh,
      workaround_zh: cause.workaround_zh,
      diagnosis_en: cause.diagnosis_en,
      workaround_en: cause.workaround_en,
      sources: cause.sources,
      verified_by: cause.verified_by,
      last_verified: cause.last_verified,
      last_verified_codex_version: cause.last_verified_codex_version
    }))
  };
}

export function buildSearchText(symptom) {
  const parts = [
    symptom.id,
    symptom.title_en,
    symptom.title_zh,
    ...(symptom.search_keywords ?? []),
    ...(symptom.causes ?? []).flatMap((cause) => [
      cause.id,
      cause.title_en,
      cause.title_zh,
      ...(cause.known_offenders ?? []),
      ...(cause.platforms ?? []).flatMap((platform) => [platform, platformLabel(platform)])
    ])
  ];
  return parts.filter(Boolean).join(" ").toLowerCase();
}

export function bySurface(symptoms) {
  const groups = new Map();
  for (const symptom of symptoms) {
    for (const surface of symptom.surfaces) {
      if (!groups.has(surface)) groups.set(surface, []);
      groups.get(surface).push(symptom);
    }
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function urlJoin(base, pathname = "") {
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${cleanBase}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
}

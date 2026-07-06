import fs from "node:fs/promises";
import path from "node:path";
import { loadFixbook, normalizedKnownIssues } from "./lib/data.mjs";

const data = await loadFixbook();
const outDir = path.join(process.cwd(), "public");
await fs.mkdir(outDir, { recursive: true });

const knownIssues = normalizedKnownIssues(data);
await fs.writeFile(
  path.join(outDir, "known-issues.json"),
  `${JSON.stringify(knownIssues, null, 2)}\n`,
  "utf8"
);


console.log(`Generated public/known-issues.json for ${data.causes.length} cause(s).`);

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadFixbook, readJson } from "./lib/data.mjs";

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const [symptomSchema, causeSchema, data] = await Promise.all([
  readJson("schema/symptom.schema.json"),
  readJson("schema/cause.schema.json"),
  loadFixbook()
]);

const validateSymptom = ajv.compile(symptomSchema);
const validateCause = ajv.compile(causeSchema);
const errors = [];

function reportSchemaErrors(kind, item, validate) {
  const { __file, causes, ...schemaItem } = item;
  const ok = validate(schemaItem);
  if (!ok) {
    for (const error of validate.errors ?? []) {
      errors.push(`${kind} ${item.__file ?? item.id}: ${error.instancePath || "/"} ${error.message}`);
    }
  }
}

for (const symptom of data.symptoms) reportSchemaErrors("symptom", symptom, validateSymptom);
for (const cause of data.causes) reportSchemaErrors("cause", cause, validateCause);

function checkDuplicateIds(kind, items) {
  const seen = new Map();
  for (const item of items) {
    if (seen.has(item.id)) {
      errors.push(`${kind} duplicate id '${item.id}' in ${seen.get(item.id)} and ${item.__file}`);
    }
    seen.set(item.id, item.__file);
  }
}

checkDuplicateIds("symptom", data.symptoms);
checkDuplicateIds("cause", data.causes);

for (const symptom of data.symptoms) {
  for (const causeId of symptom.cause_ids) {
    if (!data.causeById.has(causeId)) {
      errors.push(`symptom ${symptom.__file}: cause_ids references missing cause '${causeId}'`);
    }
  }
}

for (const cause of data.causes) {
  for (const source of cause.sources) {
    try {
      new URL(source);
    } catch {
      errors.push(`cause ${cause.__file}: invalid source URL '${source}'`);
    }
  }
}

if (errors.length > 0) {
  console.error("Codex Fixbook data validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${data.symptoms.length} symptom(s) and ${data.causes.length} cause(s).`);

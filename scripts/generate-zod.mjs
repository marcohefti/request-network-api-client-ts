#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const require = createRequire(import.meta.url);
const SPEC_PATH = require.resolve('@request-suite/request-client-contracts/specs/openapi/request-network-openapi.json');
const OUT_DIR = path.join(ROOT, 'src/validation/generated');
const OUT_FILE = path.join(OUT_DIR, 'openapi.schemas.generated.ts');
const GROUP_DIR = path.join(OUT_DIR, 'groups');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.pnpm', '.turbo', 'coverage']);

/** Sanitize a string to a safe TS identifier */
function toIdent(str) {
  const base = String(str).replace(/[^a-zA-Z0-9_]/g, '_');
  return /^[a-zA-Z_]/.test(base) ? base : `OP_${base}`;
}

function toMediaVariant(mediaType) {
  if (!mediaType) return 'application/json';
  const [base] = mediaType.split(';');
  return base.toLowerCase();
}

function ensureGroup(map, key) {
  if (!map.has(key)) {
    map.set(key, { lines: [], needsErrorSupport: false });
  }
  return map.get(key);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readSpec() {
  try {
    const raw = fs.readFileSync(SPEC_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[generate-zod] Unable to read spec at ${SPEC_PATH}:`, err?.message);
    return null;
  }
}

function aLiteral(v) {
  const s = typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : String(v);
  return `z.literal(${s})`;
}

function toZod(schema, components) {
  if (!schema || typeof schema !== 'object') return 'z.unknown()';
  if (schema.$ref) {
    const ref = schema.$ref.replace('#/components/schemas/', '');
    const refSchema = components?.schemas?.[ref];
    return toZod(refSchema, components);
  }
  if (schema.enum && Array.isArray(schema.enum)) {
    const lits = schema.enum.map(aLiteral).join(', ');
    return schema.enum.every((v) => typeof v === 'string') ? `z.enum([${schema.enum.map((s) => `'${String(s)}'`).join(', ')}])` : `z.union([${lits}])`;
  }
  if (schema.const !== undefined) {
    return aLiteral(schema.const);
  }
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    return `z.union([${schema.oneOf.map((s) => toZod(s, components)).join(', ')}])`;
  }
  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    return `z.union([${schema.anyOf.map((s) => toZod(s, components)).join(', ')}])`;
  }
  if (schema.allOf && Array.isArray(schema.allOf) && schema.allOf.length >= 2) {
    const [first, second] = schema.allOf;
    return `z.intersection(${toZod(first, components)}, ${toZod(second, components)})`;
  }
  if (schema.type === 'array') {
    let arr = `z.array(${toZod(schema.items, components)})`;
    if (schema.nullable) arr = `${arr}.nullable()`;
    return arr;
  }
  if (schema.type === 'object' || schema.properties) {
    const props = schema.properties || {};
    const req = new Set(schema.required || []);
    const entries = Object.entries(props).map(([k, v]) => {
      const inner = toZod(v, components);
      const decorated = req.has(k) ? inner : `(${inner}).optional()`;
      return `${JSON.stringify(k)}: ${decorated}`;
    });
    const shape = `{ ${entries.join(', ')} }`;
    let expr = `z.object(${shape}).passthrough()`;
    if (schema.additionalProperties) {
      const ap = schema.additionalProperties === true ? 'z.unknown()' : toZod(schema.additionalProperties, components);
      expr = `${expr}.catchall(${ap})`;
    }
    if (schema.nullable) expr = `${expr}.nullable()`;
    if (req.size > 0) {
      // Zod requires keys to exist; passthrough still allows extra fields.
      // Requiredness is implicit in the object shape; we won't refine here for simplicity.
    }
    return expr;
  }
  switch (schema.type) {
    case 'string':
      return schema.nullable ? 'z.string().nullable()' : 'z.string()';
    case 'integer':
    case 'number':
      return schema.nullable ? 'z.number().nullable()' : 'z.number()';
    case 'boolean':
      return schema.nullable ? 'z.boolean().nullable()' : 'z.boolean()';
    default:
      return schema.nullable ? 'z.unknown().nullable()' : 'z.unknown()';
  }
}

function detectGroup(op) {
  const tag = Array.isArray(op.tags) && op.tags.length > 0 ? String(op.tags[0]) : '';
  if (tag) return tag.toLowerCase().replace(/\s+/g, '-');
  const id = String(op.operationId || 'misc');
  const prefix = id.split('_')[0] || id;
  const clean = prefix.replace(/controller/i, '');
  return clean.replace(/[^a-zA-Z0-9]+/g, '-').replace(/-+/g, '-').toLowerCase();
}

function isWithinOutDir(dir) {
  const normalized = path.resolve(dir);
  return normalized === OUT_DIR || normalized.startsWith(`${OUT_DIR}${path.sep}`);
}

function findUnexpectedGeneratedDirs(rootDir) {
  const stack = [rootDir];
  const unexpected = [];

  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.name === 'generated') {
        const parent = path.basename(path.dirname(full));
        if (parent === 'validation' && !isWithinOutDir(full)) {
          unexpected.push(full);
        }
      }
      stack.push(full);
    }
  }

  return unexpected;
}

function assertGeneratedInBounds() {
  const strayDirs = findUnexpectedGeneratedDirs(ROOT);
  if (strayDirs.length > 0) {
    const details = strayDirs.map((dir) => ` - ${path.relative(ROOT, dir)}`).join('\n');
    throw new Error(
      `[generate-zod] Unexpected generated artifacts outside src/validation/generated:\n${details}\n` +
        'Clean up the stray directories before re-running this script.'
    );
  }
}

function emit() {
  assertGeneratedInBounds();

  const spec = readSpec();
  ensureDir(OUT_DIR);

  if (!spec || !spec.paths) {
    const fallback = `// Auto-generated. Do not edit.\n// No spec available; placeholder module.\nexport {};\n`;
    fs.writeFileSync(OUT_FILE, fallback);
    console.log(`[generate-zod] Wrote placeholder ${path.relative(ROOT, OUT_FILE)}`);
    return;
  }

  const header = [
    '// Auto-generated by scripts/generate-zod.mjs. Do not edit.',
    "import { z } from 'zod';",
    '',
    "import { schemaRegistry } from '../schema.registry';",
    '',
  ];

  const METHODS = ['get','post','put','patch','delete','options','head'];

  const bodyLines = [];
  let needsErrorSupport = false;

  const groups = new Map(); // groupName -> { lines: string[], needsErrorSupport: boolean }
  for (const [apiPath, pathItem] of Object.entries(spec.paths)) {
    for (const method of METHODS) {
      const op = pathItem?.[method];
      if (!op || !op.operationId) continue;
      const opId = op.operationId;
      const opIdent = toIdent(opId);
      const groupName = detectGroup(op);
      const group = ensureGroup(groups, groupName);

      const requestBody = op.requestBody?.content;
      if (requestBody) {
        for (const [mediaType, media] of Object.entries(requestBody)) {
          const schema = media?.schema;
          if (!schema) continue;
          const variant = toMediaVariant(mediaType);
          const variantIdent = variant === 'application/json' ? 'Request' : `Request_${variant}`;
          const constName = `${opIdent}_${toIdent(variantIdent)}`;
          const schemaExpr = toZod(schema, spec.components);
          const reg =
            `schemaRegistry.register({ key: { operationId: '${opId}', kind: 'request', variant: '${variant}' }, schema: ${constName} });`;
          const block = [
            `// ${method.toUpperCase()} ${apiPath} -> ${opId} request (${variant})`,
            `export const ${constName} = ${schemaExpr};`,
            reg,
            '',
          ];
          bodyLines.push(...block);
          group.lines.push(...block);
        }
      }

      for (const [status, resp] of Object.entries(op.responses ?? {})) {
        const statusNum = Number(status);
        const includeSuccess = status === '200' || status === '201';
        const includeError = Number.isFinite(statusNum) && statusNum >= 400;
        if (!includeSuccess && !includeError) continue;

        const content = resp?.content?.['application/json'] ?? resp?.content?.['application/problem+json'];
        const schema = content?.schema;
        let schemaExpr;
        if (schema) {
          schemaExpr = toZod(schema, spec.components);
        } else if (includeError) {
          schemaExpr = 'ErrorEnvelopeSchema';
          needsErrorSupport = true;
          group.needsErrorSupport = true;
        } else {
          schemaExpr = 'z.unknown()';
        }

        const constName = `${opIdent}_${status}`;
        const decl = `export const ${constName} = ${schemaExpr};`;
        const reg = `schemaRegistry.register({ key: { operationId: '${opId}', kind: 'response', status: ${status} }, schema: ${constName} });`;
        const block = [`// ${method.toUpperCase()} ${apiPath} -> ${opId} (${status})`, decl, reg, ''];
        bodyLines.push(...block);
        group.lines.push(...block);
      }
    }
  }

  const supportLines = needsErrorSupport
    ? [
        'const ErrorDetailSchema = z',
        '  .object({',
        '    message: z.string(),',
        '    code: z.string().optional(),',
        '    field: z.string().optional(),',
        '    source: z',
        '      .object({',
        '        pointer: z.string().optional(),',
        '        parameter: z.string().optional(),',
        '      })',
        '      .passthrough()',
        '      .optional(),',
        '    meta: z.record(z.unknown()).optional(),',
        '  })',
        '  .passthrough();',
        '',
        'const ErrorEnvelopeSchema = z',
        '  .object({',
        '    status: z.number().optional(),',
        '    statusCode: z.number().optional(),',
        '    code: z.string().optional(),',
        '    error: z.string().optional(),',
        '    message: z',
        '      .union([',
        '        z.string(),',
        '        z.array(z.union([z.string(), ErrorDetailSchema])),',
        '        ErrorDetailSchema,',
        '      ])',
        '      .optional(),',
        '    detail: z.unknown().optional(),',
        '    errors: z.array(ErrorDetailSchema).optional(),',
        '    requestId: z.string().optional(),',
        '    correlationId: z.string().optional(),',
        '    retryAfter: z.union([z.number(), z.string()]).optional(),',
        '    retryAfterMs: z.number().optional(),',
        '    meta: z.record(z.unknown()).optional(),',
        '  })',
        '  .passthrough();',
        '',
      ]
    : [];

  const out = header.concat(supportLines, bodyLines).join('\n');
  fs.writeFileSync(OUT_FILE, out);
  const totalLines = header.length + supportLines.length + bodyLines.length;
  console.log(`[generate-zod] Wrote ${path.relative(ROOT, OUT_FILE)} with ${totalLines} lines`);

  ensureDir(GROUP_DIR);
  for (const [groupName, groupEntry] of groups.entries()) {
    const file = path.join(GROUP_DIR, `${groupName}.schemas.generated.ts`);
    ensureDir(path.dirname(file));
    const relImport = path.relative(path.dirname(file), path.join(ROOT, 'src/validation/schema.registry')).replace(/\\/g, '/');
    const head = [
      '// Auto-generated by scripts/generate-zod.mjs. Do not edit.',
      "import { z } from 'zod';",
      '',
      `import { schemaRegistry } from '${relImport}';`,
      '',
    ];
    const groupSupport = groupEntry.needsErrorSupport ? supportLines : [];
    const groupOut = head.concat(groupSupport, groupEntry.lines).join('\n');
    fs.writeFileSync(file, groupOut);
    const groupLineCount = head.length + groupSupport.length + groupEntry.lines.length;
    console.log(`[generate-zod] Wrote group ${path.relative(ROOT, file)} with ${groupLineCount} lines`);
  }

  assertGeneratedInBounds();
}

emit();

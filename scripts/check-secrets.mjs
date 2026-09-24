#!/usr/bin/env node
// Escanea el repositorio en busca de secretos y datos privados antes de un commit.
// Uso: node scripts/check-secrets.mjs   → código 1 si encuentra algo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SELF = fileURLToPath(import.meta.url);
const SKIP_DIRS = new Set(['.git', 'node_modules']);
const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.ico', '.pkt', '.zip']);
const ALLOWED_EMAIL = /@(example\.(com|org)|users\.noreply\.github\.com)$/i;

const RULES = [
  ['Token de bot de Telegram', /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/],
  ['Clave de OpenRouter', /\bsk-or-v1-[a-f0-9]{20,}/],
  ['Clave de OpenAI', /\bsk-(proj-)?[A-Za-z0-9]{20,}/],
  ['Clave de Anthropic', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['Webhook de Discord', /discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+/],
  ['JWT / clave API de n8n', /\beyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{10,}/],
  ['Cabecera Bearer con valor', /Bearer\s+[A-Za-z0-9._~+/-]{20,}/],
  ['IP privada', /\b(10\.\d{1,3}|172\.(1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/],
  ['ID numérico largo entre comillas (chat, usuario...)', /['"]\d{9,12}['"]/],
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (!BINARY_EXT.has(path.extname(entry.name).toLowerCase()) && full !== SELF) yield full;
  }
}

function scanLine(line) {
  const hits = RULES.filter(([, re]) => re.test(line)).map(([name]) => name);
  const emails = line.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) ?? [];
  if (emails.some((e) => !ALLOWED_EMAIL.test(e))) hits.push('Correo electrónico');
  return hits;
}

const findings = [];
for (const file of walk(ROOT)) {
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const hit of scanLine(line)) findings.push(`${path.relative(ROOT, file)}:${i + 1}  ${hit}`);
  });
}

if (findings.length) {
  console.error(`✗ ${findings.length} posible(s) secreto(s):\n  ${findings.join('\n  ')}`);
  process.exit(1);
}
console.log('✓ Sin secretos ni datos privados detectados.');

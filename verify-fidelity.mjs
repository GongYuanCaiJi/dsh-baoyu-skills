#!/usr/bin/env node
/**
 * Verify that the shipped upstream trees are byte-identical to the pinned
 * upstream commit (playbook N4: 「逐字保留」是宣稱，釘上雜湊之後才是事實).
 *
 * Reads THIRD_PARTY_NOTICES.sha256 (one "sha256  relative-path" per line),
 * recomputes every listed file under the verbatim scope, and exits non-zero on
 * any mismatch, a missing file, or an extra file inside the scope. Used by
 * `npm prepare` and `npm prepack` so a stripped or drifted tree fails loudly
 * instead of shipping. Portable across macOS/Linux (no shasum/sha256sum dep).
 *
 * Verbatim scope = the upstream trees that must stay byte-identical:
 * skills/, packages/, docs/ (incl. the relocated UPSTREAM-README*), screenshots/,
 * scripts/, .claude-plugin/, .claude/, .github/, .githooks/, and the root files
 * CHANGELOG.md / CHANGELOG.zh.md / CLAUDE.md / .releaserc.yml / bun.lockb.
 * Packaging-layer files (package.json, LICENSE, index.js, test/, README.md …)
 * are NOT in the manifest and are therefore not part of the byte-identity claim.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)));
const MANIFEST = join(ROOT, 'THIRD_PARTY_NOTICES.sha256');

const VERBATIM_DIRS = [
  'skills',
  'packages',
  'docs',
  'screenshots',
  'scripts',
  '.claude-plugin',
  '.claude',
  '.github',
  '.githooks',
];
const VERBATIM_ROOT_FILES = [
  'CHANGELOG.md',
  'CHANGELOG.zh.md',
  'CLAUDE.md',
  '.releaserc.yml',
  'bun.lockb',
];

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const expected = new Map();
for (const line of readFileSync(MANIFEST, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const hash = trimmed.slice(0, 64);
  const rel = trimmed.slice(65).trim();
  expected.set(rel, hash);
}

// 实际落在逐字范围内的档案（相对路径）
const actualFiles = new Set();
for (const dir of VERBATIM_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    actualFiles.add(relative(ROOT, file));
  }
}
for (const file of VERBATIM_ROOT_FILES) {
  const full = join(ROOT, file);
  if (statSync(full, { throwIfNoEntry: false })?.isFile()) actualFiles.add(file);
}

let failed = 0;

for (const rel of expected.keys()) {
  const file = join(ROOT, rel);
  if (!statSync(file, { throwIfNoEntry: false })?.isFile()) {
    console.error(`MISSING ${rel}`);
    failed += 1;
    continue;
  }
  const hash = sha256(file);
  if (hash !== expected.get(rel)) {
    console.error(`DRIFT ${rel}\n  expected ${expected.get(rel)}\n  actual   ${hash}`);
    failed += 1;
  }
}

// 逐字范围内不允许出现 manifest 外的档案（多出来的 = 有人在逐字树上动了手脚）
for (const rel of actualFiles) {
  if (!expected.has(rel)) {
    console.error(`EXTRA ${rel} (in verbatim scope but not in manifest)`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\nverify-fidelity: ${failed} failure(s). Upstream trees are not byte-identical to the pinned commit.`);
  process.exit(1);
}

console.log(`verify-fidelity: OK (${expected.size} files byte-identical to upstream pin)`);

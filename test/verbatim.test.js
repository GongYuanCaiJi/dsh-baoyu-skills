import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// 逐字保真测试：repo 里每个「上游逐字档」的 SHA-256 必须等于
// THIRD_PARTY_NOTICES.sha256 钉死的值。这让「100% 原样复制」从宣称变成可自动验证的事实
// （playbook N4）。直接跑出货的 scripts/verify-fidelity.mjs，而不是重写一份 hash walk：
// manifest 是独立真值来源，脚本是出货工具，测试证明两者一致。
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('保真: 出货的 verify-fidelity.mjs 通过（每个 manifest 档案逐字相符、无多无少）', () => {
  const result = spawnSync(process.execPath, ['verify-fidelity.mjs'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `verify-fidelity 必须 exit 0\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
});

test('保真: manifest 至少钉住 900 个档案（上游 920 档减已适配包装档）', () => {
  const manifest = readFileSync(join(ROOT, 'THIRD_PARTY_NOTICES.sha256'), 'utf8');
  const entries = manifest.split('\n').filter((line) => line.trim().length > 0);
  assert.ok(entries.length >= 900, `manifest 至少 900 行（实际 ${entries.length}）`);
  for (const line of entries) {
    assert.match(line, /^[0-9a-f]{64} {2}\S/, `manifest 行格式: sha256 + 两个空格 + 相对路径`);
  }
});

test('保真: manifest 不含包装层新档（index.js / test / README 都不是上游内容）', () => {
  const manifest = readFileSync(join(ROOT, 'THIRD_PARTY_NOTICES.sha256'), 'utf8');
  const lines = manifest.split('\n').filter((line) => line.trim().length > 0);
  const paths = lines.map((line) => line.slice(65).trim());
  // 只查「根层级的包装档」：packages/*/dist/index.js 是上游逐字内容，不算
  for (const banned of ['index.js', 'index.d.ts', 'cordis.patch.yml', 'package.json']) {
    assert.ok(!paths.includes(banned), `manifest 不得含根层级 ${banned}`);
  }
  assert.ok(paths.every((p) => !p.startsWith('test/')), 'manifest 不得含 test/');
  assert.ok(paths.every((p) => !p.startsWith('README.md')), 'manifest 不得含根层级 README.md');
});

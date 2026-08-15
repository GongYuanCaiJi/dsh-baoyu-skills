import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// 结构测试：github:/本地安装后「可 boot」的最低保证。
// 被 package.json 的 prepare 在每次 install 时执行，因此只做零依赖的档案检查，
// 且必须在任何合法安装状态下通过（这里验的是形状，不是上游逐字内容）。
const ROOT = fileURLToPath(new URL('..', import.meta.url));

test('套件形状: skills/ 有 21 个目录且各含 SKILL.md', () => {
  const skillsDir = join(ROOT, 'skills');
  assert.ok(existsSync(skillsDir), 'skills/ 存在');
  const dirs = readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory());
  assert.equal(dirs.length, 21, '21 个 skill 目录');
  for (const d of dirs) {
    assert.ok(existsSync(join(skillsDir, d.name, 'SKILL.md')), `skills/${d.name}/SKILL.md 存在`);
  }
});

test('套件形状: 必要档案都在（boot 所需）', () => {
  for (const f of ['package.json', 'index.js', 'cordis.patch.yml', 'LICENSE', 'THIRD_PARTY_NOTICES.md']) {
    assert.ok(existsSync(join(ROOT, f)), `${f} 存在`);
  }
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml', 'dsh.bundle.patch 指向 cordis.patch.yml');
});

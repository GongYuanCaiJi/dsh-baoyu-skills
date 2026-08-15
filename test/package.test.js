import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// package.json / cordis.patch.yml / LICENSE / THIRD_PARTY_NOTICES 的公开契约。
// 这层是「移植包装」：每条断言对应 playbook 的一条规则，改包装必须先改这里。
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

test('package.json: 身分与 description', () => {
  assert.equal(pkg.name, 'dsh-baoyu-skills');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.license, 'MIT');
  // description 写进上游名（A 报告 10/16）且与 GitHub description 一字不差（16/18）
  const expected = '宝玉技能库（移植自 JimLiu/baoyu-skills）';
  assert.equal(pkg.description, expected);
  assert.ok(pkg.description.includes('baoyu-skills'), 'description 含上游名');
});

test('package.json: scripts 依 playbook（上游 script 全部保留 + dsh 契约补齐）', () => {
  for (const s of ['test', 'prepare', 'prepack', 'prepublishOnly']) {
    assert.ok(pkg.scripts?.[s], `scripts.${s} 存在`);
  }
  // 上游三个 script 全数保留，一个都没删（playbook Y2：每删一个要有理由）
  for (const kept of ['test', 'test:coverage', 'verify:skill-release-commits']) {
    assert.ok(pkg.scripts?.[kept], `scripts.${kept} 保留（playbook Y2：每删一个要有理由）`);
  }
});

test('package.json: dsh 插件合约', () => {
  assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml');
  assert.equal(pkg.main, 'index.js', 'dsh 由 main 載入 cordis 插件');
  assert.equal(pkg.types, 'index.d.ts', 'types 指向 index.d.ts（playbook 必備欄位）');
  assert.equal(pkg.dependencies?.['@deepseek-ai/dsh-skill'], '0.1.0-rc.6', '精確釘版（playbook：不用 caret）');
  for (const f of ['index.js', 'index.d.ts', 'cordis.patch.yml', 'THIRD_PARTY_NOTICES.md', 'skills/', 'packages/']) {
    assert.ok(pkg.files?.includes(f), `files 含 ${f}`);
  }
  assert.equal(pkg.keywords?.includes('dsh-plugin'), true, 'keywords 含 dsh-plugin');
  assert.equal(pkg.keywords?.includes('baoyu-skills'), true, 'keywords 保留上游');
  assert.equal(pkg.repository?.url, 'git+https://github.com/GongYuanCaiJi/dsh-baoyu-skills.git');
  assert.equal(pkg.homepage, 'https://github.com/GongYuanCaiJi/dsh-baoyu-skills');
  assert.equal(pkg.bugs?.url, 'https://github.com/GongYuanCaiJi/dsh-baoyu-skills/issues');
  assert.ok(pkg.author, 'author 存在');
});

test('cordis.patch.yml: insert 本插件', () => {
  const patch = readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8');
  assert.match(patch, /^-\s*insert:/m, '顶层 insert 条目');
  assert.match(patch, /- id: dsh-baoyu-skills/, 'insert 本插件 id');
  assert.match(patch, /name: dsh-baoyu-skills/, 'insert 本插件 name');
});

test('LICENSE: 上游逐字 + 移植者角色行（无 NOASSERTION 前缀）', () => {
  const license = readFileSync(join(ROOT, 'LICENSE'), 'utf8');
  assert.ok(license.includes('Copyright (c) 2026 Jim Liu'), '上游 copyright 行逐字保留');
  assert.ok(license.includes('Copyright (c) 2026 GongYuanCaiJi (dsh port)'), '移植者行标 (dsh port) 角色');
  assert.ok(license.includes('MIT License'), 'MIT 全文');
  assert.ok(!license.includes('Original work:'), '无会让 GitHub 认不出 MIT 的前缀');
  assert.ok(!license.includes('Modified work:'), '无会让 GitHub 认不出 MIT 的前缀');
});

test('THIRD_PARTY_NOTICES.md: 钉住上游 git 身分', () => {
  const notices = readFileSync(join(ROOT, 'THIRD_PARTY_NOTICES.md'), 'utf8');
  for (const pin of [
    'JimLiu/baoyu-skills',
    '6b7a2e417500561a5ecdd0b168332f4142584617',
    '2026-07-03',
    'MIT',
  ]) {
    assert.ok(notices.includes(pin), `NOTICES 含 ${pin}`);
  }
});

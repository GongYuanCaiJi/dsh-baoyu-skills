import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// README 的公开契约（cn-repo-conventions N=73 + A 报告 N=18 + playbook G1/H1）：
// 双语两段都要改到、未发布就不准裸名安装、attribution 与回连齐备。
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');

test('README: 双语两段都存在', () => {
  assert.match(readme, /^# 🧰 dsh-baoyu-skills$/m, '中文段标题');
  assert.match(readme, /^## English$/m, '切换器锚点');
});

test('README: 两段都有安装指令（github: + 本地路径），无裸名', () => {
  // 未发布到 npm → 裸名 `add dsh-baoyu-skills` 会 404（playbook G1/H1，中过两次）
  assert.equal(readme.match(/add dsh-baoyu-skills/g)?.length ?? 0, 0, '零裸名安装');
  const cn = readme.split('## English')[0];
  const en = readme.split('## English')[1];
  assert.ok(cn.includes('add github:GongYuanCaiJi/dsh-baoyu-skills'), '中文段有 github: 安装');
  assert.ok(en.includes('add github:GongYuanCaiJi/dsh-baoyu-skills'), '英文段有 github: 安装');
  assert.ok(cn.includes('allowBuilds'), '中文段有 allowBuilds 提示');
  assert.ok(en.includes('allowBuilds'), '英文段有 allowBuilds 提示');
  assert.ok(cn.includes('git clone https://github.com/GongYuanCaiJi/dsh-baoyu-skills.git'), '中文段有本地路径');
  assert.ok(en.includes('git clone https://github.com/GongYuanCaiJi/dsh-baoyu-skills.git'), '英文段有本地路径');
  // 本地安装必须在 clone 目录内用 `add .`（playbook 新条目 1：cd 之后的相对路径基准会失效，
  // dsh 对不存在的目录只打一句 WARN、exit 0，bundle 不启动 —— 中过两次）
  assert.ok(cn.includes('add .'), '中文段本地安装用 add .（cd 之后）');
  assert.ok(en.includes('add .'), '英文段本地安装用 add .（cd 之后）');
  assert.equal(readme.includes('/path/to'), false, '无 /path/to 占位路径');
});

test('README: attribution 与回连（A 报告：措辞 port/移植、回连 ≥2、上游连结指套件本体）', () => {
  assert.ok(readme.includes('移植自'), '用「移植」措辞');
  const upstreamLinks = (readme.match(/https:\/\/github\.com\/JimLiu\/baoyu-skills/g) ?? []).length;
  assert.ok(upstreamLinks >= 2, `回连上游 ≥2（实际 ${upstreamLinks}）`);
  assert.ok(readme.includes('THIRD_PARTY_NOTICES.md'), '引用逐字自验文件');
  assert.ok(readme.includes('MIT'), 'LICENSE 行存在');
});

test('README: 请给上游 star（两段）', () => {
  const cn = readme.split('## English')[0];
  const en = readme.split('## English')[1];
  assert.ok(cn.includes('请也给上游点个 star'), '中文段有 star 呼吁');
  assert.ok(en.includes('please star the upstream'), '英文段有 star 呼吁');
});

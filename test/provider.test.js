import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listBundledSkills, parseFrontmatter, registerBaoyuSkills } from '../index.js';

// 上游 skills/ 底下的 21 个技能目录（钉死：新增目录却没更新测试 = 测试失败）
const EXPECTED_SKILLS = [
  'baoyu-article-illustrator',
  'baoyu-comic',
  'baoyu-compress-image',
  'baoyu-cover-image',
  'baoyu-danger-gemini-web',
  'baoyu-danger-x-to-markdown',
  'baoyu-diagram',
  'baoyu-electron-extract',
  'baoyu-format-markdown',
  'baoyu-image-gen',
  'baoyu-infographic',
  'baoyu-markdown-to-html',
  'baoyu-post-to-wechat',
  'baoyu-post-to-weibo',
  'baoyu-post-to-x',
  'baoyu-slide-deck',
  'baoyu-translate',
  'baoyu-url-to-markdown',
  'baoyu-wechat-summary',
  'baoyu-xhs-images',
  'baoyu-youtube-transcript',
];

const ROOT = fileURLToPath(new URL('..', import.meta.url));

function skillDirs() {
  return readdirSync(join(ROOT, 'skills'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

test('catalog: 刚好列出上游 21 个 skills，无多无少', () => {
  assert.deepEqual(skillDirs(), [...EXPECTED_SKILLS].sort());
  const candidates = listBundledSkills();
  assert.equal(candidates.length, EXPECTED_SKILLS.length);
  assert.deepEqual(candidates.map((c) => c.name).sort(), [...EXPECTED_SKILLS].sort());
});

test('catalog: 每个 candidate 都是 dsh 可用的形状', () => {
  for (const c of listBundledSkills()) {
    assert.match(c.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `name 必须 kebab-case: ${c.name}`);
    assert.equal(c.name, c.resourceBase.path.split('/').pop(), `name 应等于目录名: ${c.name}`);
    assert.ok(c.description.length > 0, `description 非空: ${c.name}`);
    assert.equal(c.provider, 'dsh-baoyu-skills');
    assert.equal(c.source, 'bundled');
    assert.equal(c.rank, 600, 'BUNDLED_SKILL_RANK');
    assert.deepEqual(c.invocation, { modelInvocable: true, userInvocable: true });
    assert.equal(c.resourceBase.kind, 'directory');
    assert.ok(existsSync(c.resourceBase.path), `resourceBase 目录存在: ${c.name}`);
    assert.ok(existsSync(c.locator), `SKILL.md 存在: ${c.name}`);
    assert.ok(c.locator.endsWith('SKILL.md'));
  }
});

test('frontmatter: 上游 21 个 skills 的 name 都来自 frontmatter 且与目录一致', () => {
  for (const dir of EXPECTED_SKILLS) {
    const body = readFileSync(join(ROOT, 'skills', dir, 'SKILL.md'), 'utf8');
    const fm = parseFrontmatter(body);
    assert.equal(fm.name, dir, `${dir}: frontmatter name 应等于目录名`);
    assert.ok(fm.description && fm.description.length > 0, `${dir}: frontmatter description 非空`);
  }
});

test('frontmatter: 折叠块描述（baoyu-translate 的 >- 多行）要折成单行文字', () => {
  const body = readFileSync(join(ROOT, 'skills', 'baoyu-translate', 'SKILL.md'), 'utf8');
  const fm = parseFrontmatter(body);
  assert.equal(fm.name, 'baoyu-translate');
  assert.ok(fm.description.startsWith('This skill should be used when the user asks'), '折行后取到真实描述');
  assert.ok(fm.description.includes('翻译'), '中文触发词在折叠描述里');
  assert.ok(!fm.description.includes('\n'), '折叠描述应折成单行');
});

test('注册线路: registerProvider 收到能 list + get 的 provider，get 回传真实档案内容', async () => {
  // 刻意不做 identity stub：register 线路如果接错（例如把 request 直接喂 run），
  // list/get 的产物对不上真实档案，这个测试会红。
  let registered = null;
  const mockCtx = {
    inject: (_deps, fn) => {
      const skillCtx = {
        skills: {
          registerProvider: (create) => {
            registered = create();
          },
        },
      };
      fn(skillCtx);
    },
  };
  registerBaoyuSkills(mockCtx);
  assert.ok(registered, 'registerProvider 必须被呼叫');
  assert.equal(registered.name, 'dsh-baoyu-skills');

  const candidates = await registered.list();
  assert.equal(candidates.length, EXPECTED_SKILLS.length);
  for (const c of candidates) {
    const skill = await registered.get(c);
    assert.ok(skill, `get 必须回传 skill: ${c.name}`);
    assert.equal(skill.name, c.name);
    assert.equal(skill.content, readFileSync(c.locator, 'utf8'), `${c.name}: content 必须是档案逐字内容`);
    assert.deepEqual(skill.resourceBase, c.resourceBase);
  }
  // 不存在的 skill → undefined（不能炸）
  const missing = await registered.get({ name: 'no-such-skill', locator: '/nonexistent/SKILL.md' });
  assert.equal(missing, undefined);
});

test('frontmatter 解析: 引号/无引号/没有 frontmatter', () => {
  const quoted = parseFrontmatter('---\nname: foo\ndescription: "带 引号 的 描述"\n---\nbody');
  assert.equal(quoted.name, 'foo');
  assert.equal(quoted.description, '带 引号 的 描述');
  const plain = parseFrontmatter('---\nname: bar\ndescription: 无引号描述\n---\nbody');
  assert.equal(plain.description, '无引号描述');
  const noFrontmatter = parseFrontmatter('没有 frontmatter 的内容');
  assert.deepEqual(noFrontmatter, {});
});

// dsh-baoyu-skills — cordis 插件入口。
//
// 职责只有一个：把本套件 skills/ 目录下的 21 个 SKILL.md 注册进 dsh 的
// skills registry（ctx.skills.registerProvider，runtime provider）。
// 注册形状照 dsh-lens（已发布、同机制的真实插件）的 dist/skills.js。
//
// skills/ 本身是上游 JimLiu/baoyu-skills（pinned commit，见
// THIRD_PARTY_NOTICES.md）的逐字复制，这里不碰内容；逐字保真由
// verify-fidelity.mjs 对 THIRD_PARTY_NOTICES.sha256 验证。

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUNDLED_SKILL_RANK } from '@deepseek-ai/dsh-skill';

export const name = 'dsh-baoyu-skills';

const PROVIDER = name;
const INVOCATION = { modelInvocable: true, userInvocable: true };
const DEFAULT_ROOT = fileURLToPath(new URL('./skills/', import.meta.url));

/**
 * 列出 skills/ 下每个含 SKILL.md 的目录，转成 dsh skill registry 的候选。
 * 只扫一层（上游 baoyu-skills 的 21 个技能全部位于 skills/<name>/SKILL.md）。
 * @param root - skills 根目录（测试可注入自订 fixture 根）
 */
export function listBundledSkills(root = DEFAULT_ROOT) {
  if (!existsSync(root)) return [];
  const skills = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = join(root, entry.name, 'SKILL.md');
    if (!existsSync(skillFile)) continue;
    const body = readFileSync(skillFile, 'utf8');
    const fm = parseFrontmatter(body);
    skills.push({
      name: fm.name || entry.name,
      description: fm.description || firstParagraph(body),
      invocation: INVOCATION,
      provider: PROVIDER,
      source: 'bundled',
      rank: BUNDLED_SKILL_RANK,
      resourceBase: { kind: 'directory', path: join(root, entry.name) },
      locator: skillFile,
    });
  }
  return skills;
}

/**
 * 从 SKILL.md 的 YAML frontmatter 抽出 name / description。
 * 支持折叠块描述（`description: >-` 接缩进行），会折成单行文字。
 * 纯解析，不做 fallback；没有 frontmatter 回传 {}。
 */
export function parseFrontmatter(markdown) {
  const match = /^---\n([\s\S]*?)\n---/u.exec(markdown);
  if (!match) return {};
  const block = match[1] ?? '';
  const lines = block.split('\n');
  const field = (key) => {
    const idx = lines.findIndex((line) => new RegExp(`^${key}:`).test(line));
    if (idx === -1) return undefined;
    const raw = lines[idx].replace(new RegExp(`^${key}:`), '').trim();
    // 折叠块标量：`description: >-` 后跟缩进行，折成单行（YAML 折叠语义）
    if (/^[>|][+-]?$/.test(raw)) {
      const folded = [];
      for (let i = idx + 1; i < lines.length; i += 1) {
        const line = lines[i];
        if (!line || !/^\s+\S/.test(line)) break;
        folded.push(line.trim());
      }
      return folded.join(' ').trim();
    }
    return raw.replace(/^['"]|['"]$/g, '').trim();
  };
  return { name: field('name'), description: field('description') };
}

/** frontmatter 之后的第一段非空、非标题文字（description 缺漏时的 fallback）。 */
function firstParagraph(markdown) {
  const body = markdown.replace(/^---[\s\S]*?---\n?/u, '');
  return body
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith('#'));
}

/** 注册 provider 进 dsh skills registry；ctx.inject 拿不到 skills 就不注册。 */
export function registerBaoyuSkills(ctx) {
  ctx.inject(['skills'], (skillCtx) => {
    const candidates = listBundledSkills();
    if (candidates.length === 0) return;
    const provider = {
      name: PROVIDER,
      list: () => Promise.resolve(candidates),
      async get(candidate) {
        if (typeof candidate.locator !== 'string' || !existsSync(candidate.locator)) return undefined;
        return { ...candidate, content: readFileSync(candidate.locator, 'utf8') };
      },
    };
    skillCtx.skills.registerProvider(() => provider);
  });
}

export function apply(ctx) {
  registerBaoyuSkills(ctx);
}

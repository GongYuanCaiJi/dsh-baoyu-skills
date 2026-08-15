# 🧰 dsh-baoyu-skills

简体中文 | [English](#english)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![DSH](https://img.shields.io/badge/DSH-DeepSeek%20Harness-blue.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![上游](https://img.shields.io/badge/移植自-baoyu--skills-orange.svg)](https://github.com/JimLiu/baoyu-skills)

> **一句话：把宝玉的 21 个日常效率 AI 技能（配图、漫画、信息图、Markdown、公众号/微博/X 发布、翻译、YouTube 字幕等）装进 DeepSeek Harness，agent 按需自动调用（移植自 JimLiu/baoyu-skills）。**

移植自 [`JimLiu/baoyu-skills`](https://github.com/JimLiu/baoyu-skills)（MIT，**25k+ stars**）。
上游 git 树 920 个文件全部搬入，其中 **916 个逐字保留**（SHA-256 钉在
[`THIRD_PARTY_NOTICES.sha256`](./THIRD_PARTY_NOTICES.sha256)，任何人可自验），
只做了让 dsh 能加载它的最小包装改动。**技能内容按「100% 原样复制」规则保留上游英文原文，未做翻译。**

## ✨ 功能

- 🎨 **内容生成** —— 文章配图（`baoyu-article-illustrator`）、封面图（`baoyu-cover-image`）、
  漫画（`baoyu-comic`）、信息图（`baoyu-infographic`）、小红书图片卡片（`baoyu-xhs-images`）、
  幻灯片图片（`baoyu-slide-deck`）
- ✍️ **内容处理** —— Markdown 格式化（`baoyu-format-markdown`）、Markdown→微信 HTML
  （`baoyu-markdown-to-html`）、翻译（`baoyu-translate`）、URL/推文→Markdown
  （`baoyu-url-to-markdown`）、YouTube 字幕（`baoyu-youtube-transcript`）
- 📤 **内容发布** —— 微信公众号（`baoyu-post-to-wechat`）、微博（`baoyu-post-to-weibo`）、
  X/Twitter（`baoyu-post-to-x`）、微信群聊精华总结（`baoyu-wechat-summary`）
- 🛠️ **工具类** —— 图片压缩（`baoyu-compress-image`）、图表绘制（`baoyu-diagram`）、
  Electron 应用资源提取（`baoyu-electron-extract`）、AI 生图多后端
  （`baoyu-image-gen`）、Gemini Web 反代（`baoyu-danger-gemini-web`）
- 🎯 **自动发现** —— 安装后 skills 出现在 dsh 的 catalog，agent 按 `description`
  自动匹配调用，无需手动引用

## 📸 效果

安装并启动 dsh 后，21 个 skills 会出现在 agent 的可用技能目录里（示意）：

```
<available_skills>
  <skill name="baoyu-post-to-wechat">Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP…</skill>
  <skill name="baoyu-translate">This skill should be used when the user asks to "translate", "翻译", "精翻"…</skill>
  <skill name="baoyu-youtube-transcript">Downloads YouTube video transcripts/subtitles and cover images…</skill>
  …共 21 个
</available_skills>
```

agent 遇到对应场景会自动 `read` 并执行 `SKILL.md` 里的完整流程（脚本、参考文件随技能
一起装载，运行方式与上游一致：优先 `bun`，否则 `npx -y bun`）。

## 📦 安装

本插件尚未发布到 npm，用 GitHub 或本地路径安装：

```bash
dsh plugin --profile <你的 profile> add github:GongYuanCaiJi/dsh-baoyu-skills
```

若 pnpm 拦下构建脚本，在 profile 的 `pnpm-workspace.yaml` 里把本包加进
`allowBuilds`（安装时的 `prepare` 只做逐字保真自检，无编译步骤）。

从本地目录安装：

```bash
git clone https://github.com/GongYuanCaiJi/dsh-baoyu-skills.git
cd dsh-baoyu-skills && npm install
dsh plugin --profile <你的 profile> add .
```

## 🚀 使用

安装后无需额外配置。直接对 agent 说需求即可，例如：

- 「把这篇 Markdown 整理成公众号文章并发出去」
- 「给这篇文章配三张插图」
- 「把这段文字翻译成英文，精翻」
- 「下载这个 YouTube 视频的字幕」

agent 会自行选中对应 skill 并按其 `SKILL.md` 执行。需要登录/凭证的技能
（发布类、浏览器类）首次运行时会引导你配置，凭证存放在 `~/.baoyu-skills/.env` 或项目级
`.baoyu-skills/.env`，与上游一致。

## 与上游的差异

只改了「让 dsh 能加载」所需的最小部分，技能内容零改动：

- **新增** cordis 插件入口（`index.js`/`index.d.ts`/`cordis.patch.yml`），把 `skills/`
  注册进 dsh 的 skills registry
- **package.json** 改为 dsh 插件合约：`name` 改 `dsh-baoyu-skills`、加 `dsh.bundle.patch`、
  `main`/`types`/`files`、description/repository 等；上游 3 个 scripts
  （`test`/`test:coverage`/`verify:skill-release-commits`）全数保留，另加
  `prepare`/`prepack`（逐字保真自检）、`prepublishOnly`、`pretest`（安装
  `baoyu-post-to-wechat` 脚本依赖，与上游 CI 一致）
- **README** 换成移植版双语说明；上游 README 原样保留在
  [`docs/UPSTREAM-README.md`](./docs/UPSTREAM-README.md) 与
  [`docs/UPSTREAM-README.zh.md`](./docs/UPSTREAM-README.zh.md)
- **LICENSE** 保留上游 MIT 原文与 copyright 行，另加移植者行
  `Copyright (c) 2026 GongYuanCaiJi (dsh port)`

## 📄 License

MIT —— 上游 [`JimLiu/baoyu-skills`](https://github.com/JimLiu/baoyu-skills) 是 MIT
（Copyright (c) 2026 Jim Liu），本移植版同样是 MIT。逐字保真证明见
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md)。

喜欢的话，**请也给上游点个 star** ⭐：[`JimLiu/baoyu-skills`](https://github.com/JimLiu/baoyu-skills)

---

## English

[简体中文](#dsh-baoyu-skills)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![DSH](https://img.shields.io/badge/DSH-DeepSeek%20Harness-blue.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![Upstream](https://img.shields.io/badge/port%20of-baoyu--skills-orange.svg)](https://github.com/JimLiu/baoyu-skills)

> **In one line: install Baoyu's 21 daily-efficiency AI skills (illustrations, comics, infographics, Markdown, WeChat/Weibo/X publishing, translation, YouTube transcripts, and more) into DeepSeek Harness; the agent invokes them on demand (ported from JimLiu/baoyu-skills).**

Ported from [`JimLiu/baoyu-skills`](https://github.com/JimLiu/baoyu-skills) (MIT, **25k+ stars**).
All 920 files of the upstream git tree are copied in, **916 byte-identical**
(SHA-256 pinned in [`THIRD_PARTY_NOTICES.sha256`](./THIRD_PARTY_NOTICES.sha256), verifiable
by anyone), with only the minimal packaging needed for dsh to load it.
Per the "100% verbatim copy" rule, skill content keeps the upstream English originals — no translation.

## ✨ Features

- 🎨 **Content generation** — article illustrations (`baoyu-article-illustrator`), cover images
  (`baoyu-cover-image`), comics (`baoyu-comic`), infographics (`baoyu-infographic`), Xiaohongshu
  image cards (`baoyu-xhs-images`), slide images (`baoyu-slide-deck`)
- ✍️ **Content processing** — Markdown formatting (`baoyu-format-markdown`), Markdown→WeChat HTML
  (`baoyu-markdown-to-html`), translation (`baoyu-translate`), URL/tweet→Markdown
  (`baoyu-url-to-markdown`), YouTube transcripts (`baoyu-youtube-transcript`)
- 📤 **Content publishing** — WeChat Official Account (`baoyu-post-to-wechat`), Weibo
  (`baoyu-post-to-weibo`), X/Twitter (`baoyu-post-to-x`), WeChat group digest
  (`baoyu-wechat-summary`)
- 🛠️ **Utilities** — image compression (`baoyu-compress-image`), diagram drawing
  (`baoyu-diagram`), Electron app extraction (`baoyu-electron-extract`), multi-backend image
  generation (`baoyu-image-gen`), Gemini Web reverse proxy (`baoyu-danger-gemini-web`)
- 🎯 **Auto-discovery** — after install the skills appear in dsh's catalog; the agent matches
  them by `description` automatically, no manual referencing

## 📸 Effect

After installing and starting dsh, the 21 skills show up in the agent's available-skill catalog
(sample):

```
<available_skills>
  <skill name="baoyu-post-to-wechat">Posts content to WeChat Official Account (微信公众号) via API or Chrome CDP…</skill>
  <skill name="baoyu-translate">This skill should be used when the user asks to "translate", "翻译", "精翻"…</skill>
  <skill name="baoyu-youtube-transcript">Downloads YouTube video transcripts/subtitles and cover images…</skill>
  …21 skills total
</available_skills>
```

The agent auto-`read`s and follows the full `SKILL.md` workflow (scripts and reference files load
with the skill; runtime matches upstream: `bun` first, else `npx -y bun`).

## 📦 Installation

This plugin is not published to npm yet — install from GitHub or a local path:

```bash
dsh plugin --profile <your profile> add github:GongYuanCaiJi/dsh-baoyu-skills
```

If pnpm blocks build scripts, add this package to `allowBuilds` in your profile's
`pnpm-workspace.yaml` (the `prepare` step only runs a byte-fidelity self-check, no compilation).

From a local directory:

```bash
git clone https://github.com/GongYuanCaiJi/dsh-baoyu-skills.git
cd dsh-baoyu-skills && npm install
dsh plugin --profile <your profile> add .
```

## 🚀 Usage

No extra configuration needed. Just ask the agent, for example:

- "Format this Markdown into a WeChat article and publish it"
- "Illustrate this article with three images"
- "Translate this text into English, refined mode"
- "Download the transcript of this YouTube video"

The agent picks the matching skill and follows its `SKILL.md`. Skills that need login/credentials
(publishing, browser-based) guide you through setup on first run; credentials live in
`~/.baoyu-skills/.env` or project-level `.baoyu-skills/.env`, same as upstream.

## Differences from upstream

Only the minimal changes needed for dsh to load it; skill content is untouched:

- **Added** cordis plugin entry (`index.js`/`index.d.ts`/`cordis.patch.yml`) that registers
  `skills/` into dsh's skills registry
- **package.json** became the dsh plugin contract: `name` → `dsh-baoyu-skills`, added
  `dsh.bundle.patch`, `main`/`types`/`files`, description/repository, etc.; all 3 upstream
  scripts (`test`/`test:coverage`/`verify:skill-release-commits`) kept, plus
  `prepare`/`prepack` (byte-fidelity check), `prepublishOnly`, and `pretest` (installs
  `baoyu-post-to-wechat` script deps, matching upstream CI)
- **README** replaced with this bilingual port README; upstream READMEs kept verbatim at
  [`docs/UPSTREAM-README.md`](./docs/UPSTREAM-README.md) and
  [`docs/UPSTREAM-README.zh.md`](./docs/UPSTREAM-README.zh.md)
- **LICENSE** keeps the upstream MIT text and copyright line, plus the porter line
  `Copyright (c) 2026 GongYuanCaiJi (dsh port)`

## 📄 License

MIT — upstream [`JimLiu/baoyu-skills`](https://github.com/JimLiu/baoyu-skills) is MIT
(Copyright (c) 2026 Jim Liu); this port is MIT as well. Byte-fidelity proof in
[`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md).

If you like it, **please star the upstream** ⭐: [`JimLiu/baoyu-skills`](https://github.com/JimLiu/baoyu-skills)

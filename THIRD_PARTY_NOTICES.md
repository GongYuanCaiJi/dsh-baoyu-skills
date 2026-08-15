# THIRD_PARTY_NOTICES

本套件（`dsh-baoyu-skills`）是 GitHub 仓库 **`JimLiu/baoyu-skills`** 的移植（port），
上游授权 **MIT**。逐字保留的宣称以本档钉死的杂凑为准，任何人可自行验证。

## 上游

| 栏位 | 值 |
|---|---|
| 上游 repo | <https://github.com/JimLiu/baoyu-skills> |
| 钉死 commit（gitHead） | `6b7a2e417500561a5ecdd0b168332f4142584617` |
| commit 时间 | `2026-07-03 20:22:55 -0500`（「更新 baoyu-wechat-summary 技能：调整输出顺序并拆分环境/群记忆参考文件」） |
| 授权 | MIT（Copyright (c) 2026 Jim Liu） |
| npm 对照 | 无 —— 上游技能库没有发布 npm 套件（`npm view baoyu-skills` = 404），逐字档以 git commit 钉死 |

## 移植说明

- 上游 git 树（920 个档案）全数搬入本 repo，其中 **916 档逐字未改**（下表
  `THIRD_PARTY_NOTICES.sha256`，每行 `sha256 + 两个空格 + 相对路径`）；四个档案因移植
  需求改写、不属逐字范围：
  - `package.json` —— dsh 插件合约（`dsh.bundle.patch`、`main`/`types`、scripts 增删、
    description、repository 等），每项改动理由见 README「与上游的差异」；
  - `package-lock.json` —— 因 package.json 的 name/deps 变更而重新产生（内容与上游不同）；
  - `LICENSE` —— MIT 全文与上游 copyright 行逐字保留，另加移植者行
    `Copyright (c) 2026 GongYuanCaiJi (dsh port)`（playbook B2 / A 报告）；
  - `.gitignore` —— 上游版保留，另加 dsh 产线要求的 `.upstream/`、`.serena/` 等项目
    （playbook D2）。
- 唯一路径变更：上游 `README.md` → `docs/UPSTREAM-README.md`、
  `README.zh.md` → `docs/UPSTREAM-README.zh.md`（内容一字未改，在逐字表内；
  repo 门面的 `README.md` 是移植版自己的双语说明，非上游档案的改写）。
- 本 repo 新增（非上游）档案：`README.md`、`THIRD_PARTY_NOTICES.md`、
  `THIRD_PARTY_NOTICES.sha256`、`index.js`、`index.d.ts`、`cordis.patch.yml`、
  `verify-fidelity.mjs`、`test/`。
- 逐字档案的 SHA-256 与 `THIRD_PARTY_NOTICES.sha256` 相同
  （`verify-fidelity.mjs` 自动核对两者，并在 `npm prepare` / `npm prepack` 时执行）。

## 自验方式

```bash
# 方式一：本 repo 内自验（npm install / prepack 也会自动跑）
node verify-fidelity.mjs

# 方式二：对照上游 pinned commit 直接 diff
git clone https://github.com/JimLiu/baoyu-skills.git /tmp/upstream
git -C /tmp/upstream checkout 6b7a2e417500561a5ecdd0b168332f4142584617
# 逐字范围（本 repo 相对 /tmp/upstream）：
diff -rq --exclude=node_modules skills /tmp/upstream/skills
diff -rq --exclude=node_modules packages /tmp/upstream/packages
diff -rq docs /tmp/upstream/docs            # docs/ 多出 UPSTREAM-README* 两个搬运档
diff -rq scripts /tmp/upstream/scripts
diff -rq .claude-plugin /tmp/upstream/.claude-plugin
diff -rq .claude /tmp/upstream/.claude
diff -rq .github /tmp/upstream/.github
diff -rq .githooks /tmp/upstream/.githooks
diff -rq screenshots /tmp/upstream/screenshots
for f in CHANGELOG.md CHANGELOG.zh.md CLAUDE.md .releaserc.yml bun.lockb; do cmp -s "$f" "/tmp/upstream/$f" || echo "DRIFT $f"; done
cmp -s docs/UPSTREAM-README.md /tmp/upstream/README.md
cmp -s docs/UPSTREAM-README.zh.md /tmp/upstream/README.zh.md
```

## 逐字档案 SHA-256（916 档）

完整清单见 [`THIRD_PARTY_NOTICES.sha256`](./THIRD_PARTY_NOTICES.sha256)
（每行 `sha256  相对路径`，共 916 行）。该档是逐字杂凑的唯一真值来源，
`verify-fidelity.mjs` 逐档核对，避免与本文档双份维护产生漂移。

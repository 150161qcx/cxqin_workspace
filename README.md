# cxqin_workspace · 个人公开知识站

一个以「专题驱动」为信息架构的个人公开知识站，围绕三个领域沉淀内容：

- **AI**：模型与 Agent 工具链的真实用法记录
- **英语**：英语学习方法与笔记
- **成长**：习惯、效率与个人成长实践

站点内容以「专题（topic）」组织文章，每个领域下通过专题串联成体系的知识库，配合标签、归档、知识地图与全文搜索，形成可检索、可漫游的知识网络。

## 技术栈

- [Astro 5](https://astro.build/) 静态站（Content Collections + 文件加载器）
- [Vitest](https://vitest.dev/) 单元测试
- [Pagefind](https://pagefind.app/) 纯静态全文搜索（构建时生成索引）

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器（默认 http://localhost:4321）
npm test           # 运行 Vitest 测试
npm run build      # 构建生产产物到 dist/，并生成 Pagefind 索引
npm run preview    # 预览构建产物
```

> 注意：搜索索引在 `npm run build` 时才生成，`npm run dev` 下无法验证搜索；请先 `npm run build`，再用 `npm run preview` 验证搜索功能。

## 如何新增文章

在 `content/articles/` 下新建 `.md` 文件（文件名即 slug），frontmatter 字段如下：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | 文章标题 |
| `date` | date | 是 | 发布日期，如 `2026-08-18` |
| `domain` | string | 是 | 所属领域，取值：`ai` \| `english` \| `growth` |
| `topics` | string[] | 否 | 引用的专题 id 列表，对应 `content/topics/` 下的文件名（不含扩展名） |
| `tags` | string[] | 否 | 标签列表 |
| `lang` | string | 否 | 语言，`zh`（默认）\| `en` |
| `summary` | string | 是 | 摘要，用于列表页展示 |
| `draft` | boolean | 否 | 草稿标记，默认 `false`；`draft: true` 不会发布 |
| `featured` | boolean | 否 | 是否精选，默认 `false` |

示例：

```markdown
---
title: 欢迎来到知识台 · AI
date: 2026-08-18
domain: ai
topics: [codex-cli]
tags: [intro, ai]
lang: zh
summary: 用真实用法记录 AI 工程判断。
featured: true
---

正文内容……
```

## 如何新增专题

在 `content/topics/` 下新建 `.md` 文件（文件名即专题 id），frontmatter 字段如下：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | string | 是 | 专题标题 |
| `domain` | string | 是 | 所属领域，取值：`ai` \| `english` \| `growth` |
| `summary` | string | 是 | 专题摘要 |
| `updated` | date | 是 | 最近更新日期 |
| `order` | number | 否 | 排序权重，默认 `0` |

示例：

```markdown
---
title: Codex CLI 笔记
domain: ai
summary: Codex / Agent 工具链实践整理
updated: 2026-08-01
order: 1
---
```

## 页面路由一览

| 路由 | 说明 |
| --- | --- |
| `/` | 首页：今日观点、最新文章、热门专题、专题精选 · 知识地图 |
| `/ai` | AI 领域页 |
| `/english` | 英语领域页 |
| `/growth` | 成长领域页 |
| `/topics` | 全部专题列表 |
| `/topics/:slug` | 单个专题页（含专题下文章列表） |
| `/articles/:slug` | 文章详情页 |
| `/tags/:tag` | 标签聚合页 |
| `/archive` | 归档页 |
| `/knowledge-map` | 知识地图 |
| `/search` | Pagefind 全文搜索页 |
| `/about` | 关于页 |

## 部署说明

站点通过 GitHub Actions 部署到 GitHub Pages，无需配置任何密钥：

1. 推送 `main` 分支后，`.github/workflows/deploy.yml` 自动触发：安装依赖 → 运行测试 → `npm run build` → 上传 `dist` 产物并部署。
2. 首次部署前，需在仓库 **Settings → Pages** 中将发布来源设置为 **GitHub Actions**。
3. 上线前，请把 `astro.config.mjs` 中的 `site` 替换为实际的 GitHub Pages URL（如 `https://<user>.github.io/<repo>/`），否则 sitemap、RSS 等依赖站点地址的功能会指向占位地址。

## 目录结构

```
.
├── .github/workflows/   # GitHub Actions 部署工作流
├── content/             # 内容目录
│   ├── articles/        # 文章（frontmatter + 正文）
│   ├── topics/          # 专题定义
│   └── pages/           # 静态页面（如 about）
├── docs/                # 规划与设计文档（不参与构建）
├── english/             # 独立的英语学习子项目（与本站点无关，有自己的 package.json）
├── public/              # 静态资源
├── scripts/             # 构建脚本（如 Pagefind 索引生成）
├── src/                 # 源码
│   ├── components/      # Astro 组件
│   ├── layouts/         # 布局
│   ├── lib/             # 内容查询等工具函数（含测试）
│   ├── pages/           # 路由页面
│   └── styles/          # 样式
└── astro.config.mjs     # Astro 配置（site 需替换为实际部署地址）
```

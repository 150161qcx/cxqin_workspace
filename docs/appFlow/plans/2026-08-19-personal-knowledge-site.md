# 个人公开知识站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use appflow:subagent-driven-development (recommended) or appflow:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在空仓库用 Astro + Content Collections + Pagefind 建成可部署的个人公开知识站（AI / 英语 / 成长），首页采用布局 A。

**Architecture:** 构建期从 `content/articles` 与 `content/topics` 读取 Markdown，Zod schema 校验；纯函数放在 `src/lib/content.ts` 负责过滤/排序/归档；Astro 页面只做取数与渲染；构建后对 `dist` 跑 Pagefind 生成静态搜索索引；CI 推送主分支自动部署静态站（默认 GitHub Pages，零额外密钥即可验收；有 Cloudflare 账号时可改为 Pages/wrangler）。

**Tech Stack:** Astro 5（静态输出）、TypeScript、Zod（via `astro:content`）、Vitest、Pagefind、GitHub Actions → GitHub Pages（可选 Cloudflare Pages）。

**上游 Spec：** `docs/appFlow/specs/2026-08-19-personal-knowledge-site-design.md`（用户已确认通过）

**结构说明：** 本项目为 Web SSG，不采用移动端 feature-first MVVM；目录遵循 Spec 3.8.1 的 Astro 内容站结构。

**UI 截图门控：** Spec 未要求按 Figma/截图像素还原，仅结构布局 A；本计划**不**启用 screenshot UI 对比工作流。

---

## 文件结构总览

| 路径 | 职责 |
|------|------|
| `package.json` / `astro.config.mjs` / `tsconfig.json` / `vitest.config.ts` | 工程、构建、测试 |
| `src/content.config.ts` | articles / topics schema |
| `src/consts.ts` | `SITE_TITLE`、`DOMAINS`、条数常量 |
| `src/lib/content.ts` | 过滤、热门专题、归档、相关文章、今日观点 |
| `src/lib/content.test.ts` | 上述纯函数单测 |
| `src/layouts/BaseLayout.astro` | 壳、SEO、页脚 |
| `src/components/SiteHeader.astro` | 顶栏（含移动折叠） |
| `src/components/ArticleCard.astro` | 文章卡片 |
| `src/components/TopicCard.astro` | 专题卡片 |
| `src/styles/global.css` | CSS 变量与排版 |
| `src/pages/**` | 全部 V1 路由 |
| `content/articles/*.md` / `content/topics/*.md` / `content/pages/about.md` | 样例与关于 |
| `scripts/pagefind.mjs` | build 后索引 |
| `.github/workflows/deploy.yml` | CI 部署 |
| `README.md` | 开发与写作说明 |

---

### Task 1: 初始化测试框架（Vitest）

**Model tier:** worker  
**Why this tier:** 机械搭建与验证命令，无架构判断。

**Files:**
- Create: `package.json`
- Create: `vitest.config.ts`
- Create: `tsconfig.json`
- Create: `src/lib/smoke.test.ts`

- [ ] **Step 1: 写入 `package.json`**

```json
{
  "name": "cxqin-knowledge-site",
  "type": "module",
  "version": "0.1.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.2.4",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: 写入 `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: 写入最小 `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 4: 写入冒烟测试 `src/lib/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: 安装并跑测试**

Run: `npm install`  
Run: `npm test`  
Expected: PASS（`smoke` 1 test）

- [ ] **Step 6: 编译/构建验证**

此时尚无 Astro 工程。记录证据：`npm test` 通过；`astro build` 尚不可用（将在 Task 2 启用）。

- [ ] **Step 7: Stage（不要 commit）**

```bash
git add package.json package-lock.json vitest.config.ts tsconfig.json src/lib/smoke.test.ts
```

---

### Task 2: 搭建 Astro 静态工程骨架

**Model tier:** standard  
**Why this tier:** 需正确配置 Astro 5 静态输出与 TypeScript 集成。

**Files:**
- Modify: `package.json`（增加 astro 依赖与类型）
- Create: `astro.config.mjs`
- Modify: `tsconfig.json`（extends astro）
- Create: `src/env.d.ts`
- Create: `src/pages/index.astro`（临时占位，后续 Task 替换）
- Create: `public/favicon.svg`（简单 SVG 即可）

- [ ] **Step 1: 安装 Astro**

Run: `npm install astro@^5.12.0`  
Run: `npm install -D @types/node`

- [ ] **Step 2: 写入 `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://example.com',
  output: 'static',
});
```

- [ ] **Step 3: 更新 `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "types": ["vitest/globals"]
  },
  "include": ["src", "vitest.config.ts"]
}
```

- [ ] **Step 4: 写入 `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 5: 写入占位首页 `src/pages/index.astro`**

```astro
---
const title = '知识台';
---
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <h1>{title}</h1>
    <p>scaffold</p>
  </body>
</html>
```

- [ ] **Step 6: 写入简易 `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1f2937"/>
  <text x="16" y="22" text-anchor="middle" font-size="14" fill="#f9fafb">K</text>
</svg>
```

- [ ] **Step 7: 跑测试与构建**

Run: `npm test`  
Expected: PASS  

Run: `npx astro build`  
Expected: 成功生成 `dist/`（本步可暂时只用 `astro build`，Pagefind 脚本在 Task 8 再接到 `npm run build`）

- [ ] **Step 8: Stage**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src/env.d.ts src/pages/index.astro public/favicon.svg
```

---

### Task 3: 常量、Content Schema 与样例内容

**Model tier:** standard  
**Why this tier:** schema 与样例必须覆盖三域、专题引用、draft/featured，直接影响后续页。

**Files:**
- Create: `src/consts.ts`
- Create: `src/content.config.ts`
- Create: `content/topics/codex-cli.md`
- Create: `content/topics/english-starter.md`
- Create: `content/articles/welcome-ai.md`
- Create: `content/articles/english-hello.md`
- Create: `content/articles/growth-habit.md`
- Create: `content/articles/codex-notes.md`
- Create: `content/articles/draft-hidden.md`
- Create: `content/pages/about.md`

- [ ] **Step 1: 写入 `src/consts.ts`**

```ts
export const SITE_TITLE = '知识台';
export const SITE_DESCRIPTION = 'AI · 英语 · 成长 — 个人公开知识站';

export const DOMAINS = ['ai', 'english', 'growth'] as const;
export type Domain = (typeof DOMAINS)[number];

export const DOMAIN_LABEL: Record<Domain, string> = {
  ai: 'AI',
  english: '英语',
  growth: '成长',
};

export const HOME_LATEST_COUNT = 10;
export const HOME_HOT_TOPICS = 5;
export const RELATED_ARTICLES = 3;
```

- [ ] **Step 2: 写入 `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { DOMAINS } from './consts';

const domainSchema = z.enum(DOMAINS);

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    domain: domainSchema,
    topics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    lang: z.enum(['zh', 'en']).default('zh'),
    summary: z.string(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const topics = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './content/topics' }),
  schema: z.object({
    title: z.string(),
    domain: domainSchema,
    summary: z.string(),
    updated: z.coerce.date(),
    order: z.number().default(0),
  }),
});

export const collections = { articles, topics };
```

- [ ] **Step 3: 写入样例专题**

`content/topics/codex-cli.md`:

```md
---
title: Codex CLI 笔记
domain: ai
summary: Codex / Agent 工具链实践整理
updated: 2026-08-01
order: 1
---
```

`content/topics/english-starter.md`:

```md
---
title: 英语打开学习
domain: english
summary: 从可读原文开始的英语学习专题
updated: 2026-08-10
order: 1
---
```

- [ ] **Step 4: 写入样例文章（覆盖三域 + 跨专题 + draft）**

`content/articles/welcome-ai.md`:

```md
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

这是 AI 专区的第一篇样例文章。
```

`content/articles/english-hello.md`:

```md
---
title: A Short English Note
date: 2026-08-17
domain: english
topics: [english-starter]
tags: [english, reading]
lang: en
summary: Read real English notes in this domain.
---

This sample article lives in the English domain and keeps the original language.
```

`content/articles/growth-habit.md`:

```md
---
title: 成长记录：小步复盘
date: 2026-08-16
domain: growth
topics: []
tags: [growth, habit]
lang: zh
summary: 把复盘写成可回看的记录。
---

成长专区样例：记录一次小步改进。
```

`content/articles/codex-notes.md`:

```md
---
title: Codex 使用备忘
date: 2026-08-15
domain: ai
topics: [codex-cli]
tags: [codex, tools]
lang: zh
summary: 配置与常见坑的短备忘。
---

挂在 Codex CLI 专题下的第二篇。
```

`content/articles/draft-hidden.md`:

```md
---
title: 草稿不应出现在生产站
date: 2026-08-14
domain: ai
topics: []
tags: [draft]
lang: zh
summary: 用于验证 draft 过滤。
draft: true
---

若生产构建仍看见本文，说明 draft 过滤失败。
```

`content/pages/about.md`:

```md
---
title: 关于
---

知识台是个人公开知识站，覆盖 AI、英语与成长。内容以仓库 Markdown 维护。
```

- [ ] **Step 5: 构建验证 schema**

Run: `npx astro build`  
Expected: 成功；若 schema 报错则按日志修正 frontmatter。

- [ ] **Step 6: Stage**

```bash
git add src/consts.ts src/content.config.ts content/
```

---

### Task 4: 内容纯函数（TDD）

**Model tier:** standard  
**Why this tier:** 核心业务规则，需测试驱动并对齐 Spec 3.9 / 5.4。

**Files:**
- Create: `src/lib/content.ts`
- Create: `src/lib/content.test.ts`
- Modify: 可删除 `src/lib/smoke.test.ts`（可选，或保留）

- [ ] **Step 1: 写失败测试 `src/lib/content.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import {
  publishedArticles,
  articlesForTopic,
  articlesForDomain,
  hotTopics,
  archiveGroups,
  pickInsight,
  relatedArticles,
  type ArticleLike,
  type TopicLike,
} from './content';

const articles: ArticleLike[] = [
  {
    id: 'a1',
    data: {
      title: 'A1',
      date: new Date('2026-08-18'),
      domain: 'ai',
      topics: ['codex-cli'],
      tags: ['ai'],
      lang: 'zh',
      summary: 's1',
      draft: false,
      featured: true,
    },
  },
  {
    id: 'a2',
    data: {
      title: 'A2',
      date: new Date('2026-08-17'),
      domain: 'ai',
      topics: ['codex-cli'],
      tags: ['ai'],
      lang: 'zh',
      summary: 's2',
      draft: false,
      featured: false,
    },
  },
  {
    id: 'draft',
    data: {
      title: 'Draft',
      date: new Date('2026-08-19'),
      domain: 'ai',
      topics: ['codex-cli'],
      tags: [],
      lang: 'zh',
      summary: 'd',
      draft: true,
      featured: true,
    },
  },
  {
    id: 'en1',
    data: {
      title: 'EN',
      date: new Date('2026-08-16'),
      domain: 'english',
      topics: ['english-starter'],
      tags: ['english'],
      lang: 'en',
      summary: 'en',
      draft: false,
      featured: false,
    },
  },
];

const topics: TopicLike[] = [
  {
    id: 'codex-cli',
    data: {
      title: 'Codex',
      domain: 'ai',
      summary: 'c',
      updated: new Date('2026-08-01'),
      order: 1,
    },
  },
  {
    id: 'english-starter',
    data: {
      title: 'EN Topic',
      domain: 'english',
      summary: 'e',
      updated: new Date('2026-08-10'),
      order: 1,
    },
  },
  {
    id: 'empty-topic',
    data: {
      title: 'Empty',
      domain: 'growth',
      summary: 'x',
      updated: new Date('2026-08-12'),
      order: 0,
    },
  },
];

describe('publishedArticles', () => {
  it('excludes drafts', () => {
    expect(publishedArticles(articles).map((a) => a.id)).toEqual(['a1', 'a2', 'en1']);
  });
});

describe('articlesForTopic', () => {
  it('returns non-draft articles for topic sorted by date desc', () => {
    expect(articlesForTopic(articles, 'codex-cli').map((a) => a.id)).toEqual(['a1', 'a2']);
  });
});

describe('articlesForDomain', () => {
  it('filters by domain', () => {
    expect(articlesForDomain(articles, 'english').map((a) => a.id)).toEqual(['en1']);
  });
});

describe('hotTopics', () => {
  it('orders by article count then updated', () => {
    const hot = hotTopics(articles, topics, 2);
    expect(hot.map((t) => t.id)).toEqual(['codex-cli', 'english-starter']);
  });
});

describe('archiveGroups', () => {
  it('groups by YYYY-MM descending', () => {
    const groups = archiveGroups(articles);
    expect(groups[0]?.key).toBe('2026-08');
    expect(groups[0]?.articles.map((a) => a.id)).toContain('a1');
  });
});

describe('pickInsight', () => {
  it('prefers latest featured non-draft', () => {
    expect(pickInsight(articles)?.id).toBe('a1');
  });
});

describe('relatedArticles', () => {
  it('prefers same topic then same domain', () => {
    const related = relatedArticles(articles, 'a1', 3);
    expect(related.map((a) => a.id)).toEqual(['a2']);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`  
Expected: FAIL（`./content` 未导出）

- [ ] **Step 3: 实现 `src/lib/content.ts`**

```ts
import type { Domain } from '../consts';

export type ArticleData = {
  title: string;
  date: Date;
  domain: Domain;
  topics: string[];
  tags: string[];
  lang: 'zh' | 'en';
  summary: string;
  draft: boolean;
  featured: boolean;
};

export type TopicData = {
  title: string;
  domain: Domain;
  summary: string;
  updated: Date;
  order: number;
};

export type ArticleLike = { id: string; data: ArticleData };
export type TopicLike = { id: string; data: TopicData };

export function publishedArticles(articles: ArticleLike[]): ArticleLike[] {
  return articles
    .filter((a) => !a.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function articlesForTopic(articles: ArticleLike[], topicId: string): ArticleLike[] {
  return publishedArticles(articles).filter((a) => a.data.topics.includes(topicId));
}

export function articlesForDomain(articles: ArticleLike[], domain: Domain): ArticleLike[] {
  return publishedArticles(articles).filter((a) => a.data.domain === domain);
}

export function topicsForDomain(topics: TopicLike[], domain: Domain): TopicLike[] {
  return topics
    .filter((t) => t.data.domain === domain)
    .sort((a, b) => a.data.order - b.data.order || b.data.updated.getTime() - a.data.updated.getTime());
}

export function hotTopics(
  articles: ArticleLike[],
  topics: TopicLike[],
  limit: number,
): TopicLike[] {
  return [...topics]
    .map((t) => ({ topic: t, count: articlesForTopic(articles, t.id).length }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.topic.data.updated.getTime() - a.topic.data.updated.getTime();
    })
    .slice(0, limit)
    .map((x) => x.topic);
}

export function archiveGroups(
  articles: ArticleLike[],
): { key: string; articles: ArticleLike[] }[] {
  const map = new Map<string, ArticleLike[]>();
  for (const a of publishedArticles(articles)) {
    const key = `${a.data.date.getUTCFullYear()}-${String(a.data.date.getUTCMonth() + 1).padStart(2, '0')}`;
    const list = map.get(key) ?? [];
    list.push(a);
    map.set(key, list);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, list]) => ({ key, articles: list }));
}

export function pickInsight(articles: ArticleLike[]): ArticleLike | undefined {
  const published = publishedArticles(articles);
  const featured = published.filter((a) => a.data.featured);
  return featured[0] ?? published[0];
}

export function relatedArticles(
  articles: ArticleLike[],
  currentId: string,
  limit: number,
): ArticleLike[] {
  const current = articles.find((a) => a.id === currentId);
  if (!current || current.data.draft) return [];
  const published = publishedArticles(articles).filter((a) => a.id !== currentId);
  const sameTopic = published.filter((a) =>
    a.data.topics.some((t) => current.data.topics.includes(t)),
  );
  const sameDomain = published.filter(
    (a) => a.data.domain === current.data.domain && !sameTopic.includes(a),
  );
  return [...sameTopic, ...sameDomain].slice(0, limit);
}

export function articlesForTag(articles: ArticleLike[], tag: string): ArticleLike[] {
  return publishedArticles(articles).filter((a) => a.data.tags.includes(tag));
}

export function assertTopicsExist(articles: ArticleLike[], topicIds: Set<string>): void {
  for (const a of publishedArticles(articles)) {
    for (const tid of a.data.topics) {
      if (!topicIds.has(tid)) {
        throw new Error(`Article ${a.id} references unknown topic: ${tid}`);
      }
    }
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npm test`  
Expected: 全部 PASS

- [ ] **Step 5: 构建验证**

Run: `npx astro build`  
Expected: 成功

- [ ] **Step 6: Stage**

```bash
git add src/lib/content.ts src/lib/content.test.ts
```

---

### Task 5: 全局样式、Layout、Header、卡片组件

**Model tier:** standard  
**Why this tier:** 影响全站信息架构呈现与移动导航，需按布局 A 气质实现。

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/ArticleCard.astro`
- Create: `src/components/TopicCard.astro`

- [ ] **Step 1: 写入 `src/styles/global.css`**

使用 CSS 变量（背景、文字、强调色、字号、间距）；正文字号可读；避免仪表盘式卡片墙。提供 `.site-header`、`.nav-toggle`、`.article-prose`、空态 `.empty` 等基础类。具体色板自定，但**不要**用紫白渐变套路；阅读优先。

- [ ] **Step 2: 写入 `BaseLayout.astro`**

接受 props：`title: string`、`description?: string`。引入 `global.css`、`SiteHeader`、`<slot />`、页脚链接「关于」。`<html lang>`：默认 `zh-CN`；文章页可由调用方传入 `lang`（`en` 时用 `en`）。

- [ ] **Step 3: 写入 `SiteHeader.astro`**

链接：`/`（站点名 `SITE_TITLE`）、`/ai`、`/english`、`/growth`、`/topics`、`/search`。移动端用 checkbox/button + CSS 折叠，窄屏可点开。

- [ ] **Step 4: 写入 `ArticleCard.astro` / `TopicCard.astro`**

ArticleCard：标题、summary、domain 标签、日期，链到 `/articles/{id}`。  
TopicCard：标题、summary、domain，链到 `/topics/{id}`。

- [ ] **Step 5: 构建验证**

Run: `npm test`  
Run: `npx astro build`  
Expected: 均成功（首页仍可为占位，只要 layout 可被后续页引用）

- [ ] **Step 6: Stage**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/
```

---

### Task 6: 首页布局 A + 三大专区页

**Model tier:** standard  
**Why this tier:** 首页是核心交付；需正确接线 `pickInsight` / `hotTopics` / 最新列表。

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/pages/ai.astro`
- Create: `src/pages/english.astro`
- Create: `src/pages/growth.astro`
- Create: `src/pages/domains/[domain].astro` **不要创建用独立专区文件即可，保持 Spec 路由 `/ai` `/english` `/growth`

- [ ] **Step 1: 实现首页 `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import ArticleCard from '../components/ArticleCard.astro';
import TopicCard from '../components/TopicCard.astro';
import { HOME_HOT_TOPICS, HOME_LATEST_COUNT, SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { hotTopics, pickInsight, publishedArticles } from '../lib/content';

const articles = await getCollection('articles');
const topics = await getCollection('topics');
const insight = pickInsight(articles);
const latest = publishedArticles(articles).slice(0, HOME_LATEST_COUNT);
const hot = hotTopics(articles, topics, HOME_HOT_TOPICS);
---
<BaseLayout title={SITE_TITLE} description={SITE_DESCRIPTION}>
  <section class="insight">
    <p class="label">今日观点</p>
    {insight ? (
      <a href={`/articles/${insight.id}`}>
        <strong>{insight.data.summary}</strong>
      </a>
    ) : (
      <p class="empty">暂无观点</p>
    )}
  </section>

  <div class="home-grid">
    <section>
      <h2>最新</h2>
      {latest.map((a) => <ArticleCard article={a} />)}
    </section>
    <section>
      <h2>热门专题</h2>
      {hot.map((t) => <TopicCard topic={t} />)}
    </section>
  </div>

  <section>
    <h2>专题精选 · 知识地图</h2>
    <p><a href="/knowledge-map">查看全部专题 →</a></p>
    <div class="topic-grid">
      {hot.slice(0, 4).map((t) => <TopicCard topic={t} />)}
    </div>
  </section>
</BaseLayout>
```

（`ArticleCard`/`TopicCard` 的 props 形状在实现时与组件定义对齐：传入 entry 或 `{ id, data }`。）

- [ ] **Step 2: 实现三专区页**

每页：`articlesForDomain` + `topicsForDomain`；标题用 `DOMAIN_LABEL`；空列表显示 `.empty`。

可用共享片段，但文件路径必须是 `src/pages/ai.astro`、`english.astro`、`growth.astro`。

- [ ] **Step 3: 构建期专题引用校验（严格模式）**

在 `src/pages/index.astro` 或单独 `src/lib/validate.ts` 于构建导入时调用：

```ts
import { assertTopicsExist } from '../lib/content';
// after getCollection
assertTopicsExist(articles, new Set(topics.map((t) => t.id)));
```

任一文引用未知 topic → 构建抛错。

- [ ] **Step 4: 验证**

Run: `npm test`  
Run: `npx astro build`  
Expected: 成功；`dist/index.html`、`dist/ai/index.html` 等存在

手工：`npx astro preview`，打开首页确认布局 A 四块（观点/最新/热门专题/知识地图入口）

- [ ] **Step 5: Stage**

```bash
git add src/pages/index.astro src/pages/ai.astro src/pages/english.astro src/pages/growth.astro
```

---

### Task 7: 专题、知识地图、文章详情、标签、归档、关于、404

**Model tier:** standard  
**Why this tier:** 多路由接线与空态/404，覆盖 Spec 主路径。

**Files:**
- Create: `src/pages/topics/index.astro`
- Create: `src/pages/topics/[slug].astro`
- Create: `src/pages/knowledge-map.astro`
- Create: `src/pages/articles/[slug].astro`
- Create: `src/pages/tags/[tag].astro`
- Create: `src/pages/archive.astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/404.astro`

- [ ] **Step 1: 专题列表与详情**

列表：全部 `TopicCard`。  
详情：`getEntry('topics', slug)`；不存在则 `return Astro.redirect('/404')` 或抛 404；`articlesForTopic`；零篇文章显示空态文案 + 链到 `/` 与对应 domain。

- [ ] **Step 2: 知识地图**

按 `ai` / `english` / `growth` 分组 `topicsForDomain`，每组渲染卡片。

- [ ] **Step 3: 文章详情**

`getEntry('articles', slug)`；`draft` 在生产不可达（`getStaticPaths` 只输出 `publishedArticles`）。渲染正文：`render(entry)`。展示 domain、tags、topics 链接；`relatedArticles`；`lang=en` 时 `BaseLayout` 的 `lang="en"`。

`getStaticPaths`：

```ts
const articles = publishedArticles(await getCollection('articles'));
return articles.map((a) => ({ params: { slug: a.id }, props: { article: a } }));
```

- [ ] **Step 4: 标签与归档**

标签：`getStaticPaths` 收集所有 tag；页内 `articlesForTag`。  
归档：`archiveGroups` 渲染年月折叠/标题列表。

- [ ] **Step 5: 关于与 404**

关于：渲染 `content/pages/about.md`（可用 `import about from '../../content/pages/about.md'` 或自行 fetch 文件；若不想进 collection，用 `fs`/`import.meta.glob` 读 raw + markdown 渲染，或简单把关于写成 `about.astro` 内嵌 Spec 文案）。推荐：`about.astro` 直接写站点说明（与 `content/pages/about.md` 内容一致），避免额外 loader。

404：提示「页面不存在」，链接首页与三大专区。

- [ ] **Step 6: 验证**

Run: `npm test`  
Run: `npx astro build`  
Expected: 成功；抽查 `dist/articles/welcome-ai/index.html`、`dist/topics/codex-cli/index.html`、`dist/knowledge-map/index.html`、`dist/archive/index.html`  
确认 `draft-hidden` **不**出现在 `dist/articles/`。

- [ ] **Step 7: Stage**

```bash
git add src/pages/topics src/pages/knowledge-map.astro src/pages/articles src/pages/tags src/pages/archive.astro src/pages/about.astro src/pages/404.astro
```

---

### Task 8: Pagefind 搜索页

**Model tier:** standard  
**Why this tier:** 需正确 post-build 索引并与静态托管路径一致。

**Files:**
- Create: `scripts/pagefind.mjs`
- Create: `src/pages/search.astro`
- Modify: `package.json`（确认 `build` 脚本）
- Modify: `.gitignore`（确保忽略 `dist/`，不忽略 pagefind 源）

- [ ] **Step 1: 安装 pagefind**

Run: `npm install -D pagefind@^1.3.0`

- [ ] **Step 2: 写入 `scripts/pagefind.mjs`**

```js
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

execFileSync('npx', ['pagefind', '--site', dist], { stdio: 'inherit', shell: true });
```

（关键是索引写入 `dist/pagefind/`。）

- [ ] **Step 3: 更新 `package.json` scripts（在本任务才接上 Pagefind）**

```json
"build": "astro build && node scripts/pagefind.mjs"
```

- [ ] **Step 4: 实现 `src/pages/search.astro`**

引入 Pagefind 默认 UI（构建后路径 `/pagefind/pagefind-ui.js` 与 css）。空结果时页面旁注：链到 `/knowledge-map`。无索引时（纯 `astro dev`）显示：「本地请先 `npm run build && npm run preview` 验证搜索」。

示例脚本加载：

```html
<link href="/pagefind/pagefind-ui.css" rel="stylesheet" />
<script is:inline src="/pagefind/pagefind-ui.js"></script>
<script is:inline>
  window.addEventListener('DOMContentLoaded', () => {
    if (window.PagefindUI) {
      new PagefindUI({ element: '#search', showSubResults: true });
    }
  });
</script>
<div id="search"></div>
<p><a href="/knowledge-map">搜索不到？去知识地图浏览专题</a></p>
```

- [ ] **Step 5: 验证**

Run: `npm test`  
Run: `npm run build`  
Expected: `dist/pagefind/` 存在；`npm run preview` 后打开 `/search`，搜索「Codex」或「知识台」能命中样例文。

- [ ] **Step 6: Stage**

```bash
git add scripts/pagefind.mjs src/pages/search.astro package.json package-lock.json
```

---

### Task 9: CI 部署与 README

**Model tier:** worker  
**Why this tier:** 配置与文档为主，路径明确。

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`
- Modify: `astro.config.mjs`（将 `site` 改为实际 Pages URL 占位说明）

- [ ] **Step 1: 写入 GitHub Actions（Cloudflare Pages 直传 artifacts 或 GitHub Pages）**

默认采用 **GitHub Pages**（零额外账号假设也可落地）。若用户已有 Cloudflare，可改 `wrangler`。

`.github/workflows/deploy.yml`：

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 更新 `astro.config.mjs` 的 `site`**

设为 `https://<user>.github.io/<repo>` 或仓库最终 URL；若暂未知，用相对可用的注释 + `site: 'https://example.com'`，并在 README 写明必须改。

- [ ] **Step 3: 重写 `README.md`**

内容包含：站点目标、本地 `npm install` / `npm run dev` / `npm test` / `npm run build` / `npm run preview`、如何新增 article/topic（frontmatter 字段表）、draft 行为、部署说明。

- [ ] **Step 4: 最终验收构建**

Run: `npm test`  
Run: `npm run build`  
Expected: 全绿；对照 Spec 验收标准逐项打勾（三域样例、≥2 专题、首页 A、搜索、draft 不可见）。

- [ ] **Step 5: Stage**

```bash
git add .github/workflows/deploy.yml README.md astro.config.mjs
```

---

## Self-Review（计划作者）

1. **Spec coverage：** 首页 A、三域、专题、知识地图、文章、标签、归档、搜索、关于、404、schema、draft、lang、CI、Pagefind、样例内容均有对应 Task；进度看板/评论/i18n 切换等非目标未纳入。  
2. **Placeholder scan：** 无 TBD/TODO；关于页允许用 astro 内嵌对齐 about.md。  
3. **Type consistency：** `ArticleLike` / `TopicLike` / `Domain` 在 Task 3–4 定义，后续任务复用。  
4. **Model tier：** 每任务已声明。  
5. **Compile coverage：** 各代码任务含 `astro build` 或说明 Task1 仅 test。  
6. **UI screenshot：** 不适用（已声明）。

---

## Plan Review

**Status:** Approved

**Issues:** 无阻塞项（已修复：Task 1 的 `build` 不再提前依赖 Pagefind；`pagefind.mjs` 去掉无用 import）。

**Recommendations（不阻塞）：**
- Spec 6.1 曾写默认 Cloudflare Pages；本计划改用 GitHub Pages 以便无密钥即可验收，语义等价。
- `ArticleCard` / `TopicCard` 的 props 在 Task 5 实现时与 Task 6 调用处保持同一形状即可。

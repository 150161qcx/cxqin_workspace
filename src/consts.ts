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

/** Prefix site paths with Astro `base` (needed for GitHub project Pages). */
export function withBase(path = '/'): string {
  const rawBase = import.meta.env.BASE_URL || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  if (path === '/' || path === '') {
    return base;
  }
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

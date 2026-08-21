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

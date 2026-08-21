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

// Content model for the SEO blog. Every post carries the metadata Google needs
// (title/description/schema) and the shape LLMs need (a short extractable answer,
// explicit entities, FAQs, comparison tables).

export type Block =
  | { t: 'p'; x: string }
  | { t: 'h2'; x: string }
  | { t: 'h3'; x: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'steps'; items: { h: string; x: string }[] }
  | { t: 'table'; caption?: string; head: string[]; rows: string[][] }
  | { t: 'note'; x: string }
  | { t: 'warn'; x: string }
  | { t: 'tip'; x: string }
  | { t: 'quote'; x: string }
  | { t: 'cta'; tool: string; x: string }
  | { t: 'code'; x: string }

export type Faq = { q: string; a: string }

export type Intent = 'howto' | 'informational' | 'comparison' | 'troubleshooting' | 'listicle'

export type Post = {
  slug: string
  cluster: string
  title: string
  /** <title> tag, keep under ~60 chars */
  metaTitle: string
  /** meta description, 140-158 chars, contains the primary keyword */
  metaDescription: string
  published: string
  updated: string
  readMinutes: number
  intent: Intent
  primaryKeyword: string
  secondaryKeywords: string[]
  /** named things Google and LLMs use to place this page in a knowledge graph */
  entities: string[]
  /** 40-60 words answering the query outright. Rendered first, marked up as speakable. */
  answer: string
  body: Block[]
  faqs: Faq[]
  relatedTools: string[]
  relatedPosts: string[]
}

export type Cluster = {
  slug: string
  name: string
  /** pillar page H1 */
  title: string
  metaTitle: string
  metaDescription: string
  /** one-paragraph definition used on the hub and in schema */
  intro: string
  answer: string
  primaryKeyword: string
  entities: string[]
  icon: string
  tools: string[]
  posts: Post[]
}

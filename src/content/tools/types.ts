// Editorial content for a tool page: what the reader is searching for, why it matters, how to
// do it here, and the questions they ask next. Rendered under the tool UI, prerendered for
// crawlers, and emitted as FAQPage + HowTo structured data. Style: no em dashes, benefit first,
// original wording, the tool name or target keyword in the first step heading.

export type ToolContent = {
  slug: string
  /** 30 to 50 words that answer the search outright; rendered first and marked speakable */
  answer: string
  /** section heading, e.g. "What is a HEIC file?"; omit to derive from the tool name */
  whatHeading?: string
  /** definitions; a converter gets one per format (source and target) */
  what: { term: string; definition: string }[]
  whyHeading?: string
  /** concrete benefits, each a short heading and one or two sentences */
  why: { h: string; x: string }[]
  howHeading?: string
  /** numbered steps for this tool, keyword in the first heading */
  how: { h: string; x: string }[]
  faqs: { q: string; a: string }[]
  /** named things search engines and assistants use to place the page */
  entities: string[]
  keywords: string[]
  /** override the derived <title> (≤ 60 chars) and meta description (140 to 158 chars) */
  metaTitle?: string
  metaDescription?: string
}

export const isFilled = (c: ToolContent | undefined): c is ToolContent => !!c && c.answer.trim().length > 0

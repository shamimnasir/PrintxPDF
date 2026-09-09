import type { Cluster, Post } from './types'
import { printWebPages } from './posts/print-web-pages'
import { savePdf } from './posts/save-webpage-as-pdf'
import { mergePdf } from './posts/merge-pdf'
import { splitPdf } from './posts/split-pdf'
import { compressPdf } from './posts/compress-pdf'
import { convertFromPdf } from './posts/convert-from-pdf'
import { convertToPdf } from './posts/convert-to-pdf'
import { pdfImages } from './posts/pdf-images'
import { signPdf } from './posts/sign-pdf'
import { ocrScans } from './posts/ocr-scanned-documents'
import { watermarkPdf } from './posts/watermark-page-numbers'
import { pdfPrivacy } from './posts/pdf-privacy'
import { printRecipes } from './posts/print-recipes'
import { studentsResearch } from './posts/students-research'
import { publishersWordpress } from './posts/publishers-wordpress'
import { savePaperInk } from './posts/save-paper-ink'
import { qrCodes } from './posts/qr-codes'
import { browserExtensions } from './posts/browser-extensions'

export const CLUSTERS: Cluster[] = [
  printWebPages,
  savePdf,
  mergePdf,
  splitPdf,
  compressPdf,
  convertFromPdf,
  convertToPdf,
  pdfImages,
  signPdf,
  ocrScans,
  watermarkPdf,
  pdfPrivacy,
  printRecipes,
  studentsResearch,
  publishersWordpress,
  savePaperInk,
  qrCodes,
  browserExtensions,
]

export const ALL_POSTS: Post[] = CLUSTERS.flatMap((c) => c.posts)

const postIndex = new Map(ALL_POSTS.map((p) => [p.slug, p]))
const clusterIndex = new Map(CLUSTERS.map((c) => [c.slug, c]))

export const postBySlug = (slug: string) => postIndex.get(slug)
export const clusterBySlug = (slug: string) => clusterIndex.get(slug)
export const clusterOf = (post: Post) => clusterIndex.get(post.cluster)

/** Posts that reference a given tool slug — used to cross-link tool pages into the blog. */
export const postsForTool = (tool: string) => ALL_POSTS.filter((p) => p.relatedTools.includes(tool))

export type { Cluster, Post, Block, Faq } from './types'

import type { Cluster, Post } from './types'
import printWebPages from './posts/print-web-pages.json'
import savePdf from './posts/save-webpage-as-pdf.json'
import mergePdf from './posts/merge-pdf.json'
import splitPdf from './posts/split-pdf.json'
import compressPdf from './posts/compress-pdf.json'
import convertFromPdf from './posts/convert-from-pdf.json'
import convertToPdf from './posts/convert-to-pdf.json'
import pdfImages from './posts/pdf-images.json'
import signPdf from './posts/sign-pdf.json'
import ocrScans from './posts/ocr-scanned-documents.json'
import watermarkPdf from './posts/watermark-page-numbers.json'
import pdfPrivacy from './posts/pdf-privacy.json'
import printRecipes from './posts/print-recipes.json'
import studentsResearch from './posts/students-research.json'
import publishersWordpress from './posts/publishers-wordpress.json'
import savePaperInk from './posts/save-paper-ink.json'
import qrCodes from './posts/qr-codes.json'
import browserExtensions from './posts/browser-extensions.json'
import editPdf from './posts/edit-pdf.json'
import slidesPdf from './posts/slides-pdf.json'
import ebooksPdf from './posts/ebooks-pdf.json'
import imagesArchives from './posts/images-archives.json'
import archiveDocuments from './posts/archive-documents.json'

// Each cluster paired with the file it lives in. The admin editor needs the file name to publish
// a change back, and deriving it from the slug would be a guess: the `edit` cluster lives in
// edit-pdf.json.
const SOURCES: [Cluster, string][] = [
  [printWebPages, 'print-web-pages'],
  [savePdf, 'save-webpage-as-pdf'],
  [mergePdf, 'merge-pdf'],
  [splitPdf, 'split-pdf'],
  [compressPdf, 'compress-pdf'],
  [convertFromPdf, 'convert-from-pdf'],
  [convertToPdf, 'convert-to-pdf'],
  [pdfImages, 'pdf-images'],
  [signPdf, 'sign-pdf'],
  [ocrScans, 'ocr-scanned-documents'],
  [watermarkPdf, 'watermark-page-numbers'],
  [pdfPrivacy, 'pdf-privacy'],
  [printRecipes, 'print-recipes'],
  [studentsResearch, 'students-research'],
  [publishersWordpress, 'publishers-wordpress'],
  [savePaperInk, 'save-paper-ink'],
  [qrCodes, 'qr-codes'],
  [browserExtensions, 'browser-extensions'],
  [editPdf, 'edit-pdf'],
  [slidesPdf, 'slides-pdf'],
  [ebooksPdf, 'ebooks-pdf'],
  [imagesArchives, 'images-archives'],
  [archiveDocuments, 'archive-documents'],
] as unknown as [Cluster, string][]

export const CLUSTERS: Cluster[] = SOURCES.map(([c]) => c)

/** Cluster slug to the JSON file it is stored in, for publishing. */
export const CLUSTER_FILE: Record<string, string> = Object.fromEntries(SOURCES.map(([c, f]) => [c.slug, f]))

export const ALL_POSTS: Post[] = CLUSTERS.flatMap((c) => c.posts)

const postIndex = new Map(ALL_POSTS.map((p) => [p.slug, p]))
const clusterIndex = new Map(CLUSTERS.map((c) => [c.slug, c]))

export const postBySlug = (slug: string) => postIndex.get(slug)
export const clusterBySlug = (slug: string) => clusterIndex.get(slug)
export const clusterOf = (post: Post) => clusterIndex.get(post.cluster)

/** Posts that reference a given tool slug, used to cross-link tool pages into the blog. */
export const postsForTool = (tool: string) => ALL_POSTS.filter((p) => p.relatedTools.includes(tool))

export type { Cluster, Post, Block, Faq } from './types'

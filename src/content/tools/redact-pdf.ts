import type { ToolContent } from './types'

export const redactPdf: ToolContent = {
  slug: 'redact-pdf',
  answer:
    'Redact PDF removes sensitive text for good. Drag boxes over anything private, and on export those pages are rasterised with the boxes painted in, so the words underneath no longer exist in the file. Untouched pages are copied as they are. It runs in your browser, free, with nothing uploaded.',
  whatHeading: 'What is PDF redaction?',
  what: [
    {
      term: 'What is PDF redaction?',
      definition:
        'Redaction is the permanent removal of content from a document before release: names, account numbers, addresses, a paragraph of privileged advice. In a PDF, real redaction means the text, image data and underlying objects are deleted, not covered. It is what freedom-of-information responses and court disclosure require: a black rectangle marks where content used to be, and nothing can be recovered behind it.',
    },
    {
      term: 'Why is a black box not redaction?',
      definition:
        'A PDF page is a list of drawing instructions. Drawing a black rectangle on top adds one more instruction; the text below is still in the **content stream**, still selectable, still found by search, and visible to anyone who deletes the rectangle or copies the text. Many public failures came from exactly this. This tool avoids it by **rasterising** each marked page into an image with the boxes already burned in, so the marked pages contain no text objects at all.',
    },
  ],
  whyHeading: 'Why redact a PDF properly?',
  why: [
    { h: 'The words are actually gone', x: 'Marked pages become a flat image with black areas. There is no text layer to select, search or recover on those pages.' },
    { h: 'Meet disclosure and privacy obligations', x: 'Court bundles, FOI responses, data subject access requests and contract sharing all require content to be removed rather than obscured.' },
    { h: 'Untouched pages stay intact', x: 'Only pages with a box are rasterised. Every other page keeps its text, links and tags, so a 200-page file with one sensitive page stays almost entirely searchable.' },
    { h: 'Whole-page redaction in one click', x: 'Redact whole page covers an entire page when it should not be released at all.' },
    { h: 'Never uploaded', x: 'The documents that need redacting are the ones you least want on a server. Everything happens in your browser.' },
  ],
  howHeading: 'How to redact a PDF, step by step',
  how: [
    { h: 'Open Redact PDF and drop your file', x: 'The first page renders. Use the arrows to reach the page with sensitive content.' },
    { h: 'Drag a box over each item', x: 'Draw a rectangle over the text or image to hide. Add as many as you need; each shows a remove control. Redact whole page covers everything on the page; Clear page removes that page\'s boxes.' },
    { h: 'Review the count', x: 'The Redactions panel shows how many boxes across how many pages. Clear all starts over.' },
    { h: 'Click Redact & download', x: 'Marked pages are rendered at twice their native resolution with the boxes painted black and saved as images; unmarked pages are copied through. The file downloads as `name-redacted.pdf`.' },
    { h: 'Scrub the rest', x: 'Redaction does not touch metadata, bookmarks or attachments. Run [Remove Metadata](/tools/remove-metadata) on the result before sending.' },
  ],
  faqs: [
    {
      q: 'Does drawing a black box redact a PDF?',
      a: 'On its own, no. A rectangle drawn over text in most editors leaves the text in the file, selectable and searchable. This tool uses the box only as a marker; the marked page is rasterised so the text underneath is not in the output at all.',
    },
    {
      q: 'Is the redacted text really unrecoverable?',
      a: 'On the marked pages, yes. Those pages are rebuilt from pixels rendered after the black areas were painted, so no text objects, fonts or hidden layers from the original remain there. Metadata, bookmarks and file attachments are separate and must be removed separately.',
    },
    {
      q: 'Can I still search the redacted pages?',
      a: 'Not directly, because they are images. If the rest of a page still needs to be searchable, run the result through [OCR PDF](/tools/ocr-pdf), which adds a new text layer built only from what is visible, so the redacted areas contribute nothing.',
    },
    {
      q: 'Can it find and redact a word everywhere automatically?',
      a: 'No. Redaction here is manual: you draw the boxes. That is deliberate, because search-and-redact misses spelling variants and images, and a person has to confirm each instance anyway.',
    },
    {
      q: 'Why is the redacted file bigger?',
      a: 'Each marked page becomes a JPEG at twice the page\'s native resolution, which is larger than the original vector text. Unmarked pages are unchanged. Run [Compress PDF](/tools/compress-pdf) afterwards if size matters.',
    },
  ],
  entities: ['Redaction', 'Rasterisation', 'PDF content stream', 'Document sanitisation', 'Freedom of information', 'Data subject access request', 'Metadata'],
  keywords: ['redact pdf', 'redact pdf free', 'permanently remove text from pdf', 'black out text in pdf', 'redact pdf online no upload', 'pdf redaction tool', 'how to redact a pdf'],
  metaTitle: 'Redact PDF: Remove Text for Good, Not Just Hide It',
  metaDescription: 'Redact a PDF free: mark sensitive text and the page is rasterised so the words are gone, not hidden behind a box. Done in your browser, nothing is uploaded.',
}

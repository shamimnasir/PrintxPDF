import type { ToolContent } from './types'

export const redactPdf: ToolContent = {
  slug: 'redact-pdf',
  answer:
    'Redact PDF blacks out private text and removes it for good. Drag boxes over anything private, and on export those pages become pictures with the boxes painted in, so the words underneath no longer exist. Untouched pages are copied as they are. Free, in your browser, nothing uploaded.',
  whatHeading: 'What is PDF redaction?',
  what: [
    {
      term: 'What is PDF redaction?',
      definition:
        'Redaction means blacking out and permanently removing content from a document before you share it: names, account numbers, addresses, a paragraph of private advice. In a PDF, real redaction means the text and pictures underneath are deleted, not just covered. That is what public records requests and court disclosure require: a black box marks where content used to be, and nothing can be recovered behind it.',
    },
    {
      term: 'Why is a black box not redaction?',
      definition:
        'A PDF page is a list of drawing instructions. Drawing a black box on top only adds one more instruction. The text below is still in the file: it can still be selected, found by search, and seen by anyone who deletes the box or copies the text. Many public embarrassments came from exactly this. This tool avoids it by turning each marked page into a picture with the boxes already painted in, so the marked pages contain no text at all.',
    },
  ],
  whyHeading: 'Why redact a PDF properly?',
  why: [
    { h: 'The words are actually gone', x: 'Marked pages become a flat picture with black areas. There is no hidden text to select, search or recover on those pages.' },
    { h: 'Meet disclosure and privacy rules', x: 'Court bundles, public records requests, personal data requests and contract sharing all require content to be removed rather than covered up.' },
    { h: 'Untouched pages stay intact', x: 'Only pages with a box are turned into pictures. Every other page keeps its text, links and structure, so a 200-page file with one private page stays almost entirely searchable.' },
    { h: 'Whole-page redaction in one click', x: 'Redact whole page covers an entire page when it should not be released at all.' },
    { h: 'Never uploaded', x: 'The documents that need redacting are the ones you least want on a server. Everything happens in your browser.' },
  ],
  howHeading: 'How to redact a PDF, step by step',
  how: [
    { h: 'Open Redact PDF and drop your file', x: 'The first page appears. Use the arrows to reach the page with private content.' },
    { h: 'Drag a box over each item', x: 'Draw a box over the text or picture to hide. Add as many as you need; each shows a remove control. Redact whole page covers everything on the page; Clear page removes that page\'s boxes.' },
    { h: 'Review the count', x: 'The Redactions panel shows how many boxes across how many pages. Clear all starts over.' },
    { h: 'Click Redact & download', x: 'Marked pages are drawn at twice their normal size with the boxes painted black and saved as pictures; unmarked pages are copied through. The file downloads as `name-redacted.pdf`.' },
    { h: 'Scrub the rest', x: 'Redaction does not touch the hidden details saved inside the file (title, author, dates), bookmarks or attachments. Run [Remove Metadata](/tools/remove-metadata) on the result before sending.' },
  ],
  faqs: [
    {
      q: 'Does drawing a black box redact a PDF?',
      a: 'On its own, no. A box drawn over text in most editors leaves the text in the file, still selectable and searchable. This tool uses the box only as a marker; the marked page is turned into a picture, so the text underneath is not in the output at all.',
    },
    {
      q: 'Is the redacted text really unrecoverable?',
      a: 'On the marked pages, yes. Those pages are rebuilt from a picture taken after the black areas were painted, so no text, fonts or hidden layers from the original remain there. The file\'s hidden details, bookmarks and attachments are separate and must be removed separately.',
    },
    {
      q: 'Can I still search the redacted pages?',
      a: 'Not directly, because they are pictures. If the rest of a page still needs to be searchable, run the result through [OCR PDF](/tools/ocr-pdf), which reads the visible words and adds them back as invisible, searchable text, so the blacked-out areas contribute nothing.',
    },
    {
      q: 'Can it find and redact a word everywhere automatically?',
      a: 'No. Redaction here is manual: you draw the boxes. That is deliberate, because search-and-redact misses spelling variations and pictures, and a person has to confirm each instance anyway.',
    },
    {
      q: 'Why is the redacted file bigger?',
      a: 'Each marked page becomes a JPEG picture at twice the page\'s normal size, which takes more space than the original text. Unmarked pages are unchanged. Run [Compress PDF](/tools/compress-pdf) afterwards if size matters.',
    },
  ],
  entities: ['Redaction', 'PDF', 'Document sanitisation', 'Freedom of information', 'Data subject access request', 'Metadata', 'Privacy'],
  keywords: ['redact pdf', 'redact pdf free', 'permanently remove text from pdf', 'black out text in pdf', 'redact pdf online no upload', 'pdf redaction tool', 'how to redact a pdf'],
  metaTitle: 'Redact PDF: Remove Text for Good, Not Just Hide It',
  metaDescription: 'Redact a PDF free: mark private text and the page becomes a picture with the words gone, not hidden behind a box. Done in your browser, nothing is uploaded.',
}

import type { ToolContent } from './types'

export const splitPdf: ToolContent = {
  slug: 'split-pdf',
  answer:
    'Split PDF breaks one PDF into several smaller files: by custom page ranges, every N pages, or one file per page. It runs in your browser, so the document is never uploaded. Download the pieces separately or as one ZIP, free and without an account.',
  whatHeading: 'What does splitting a PDF do?',
  what: [
    {
      term: 'How a PDF split works',
      definition:
        'Each output is a brand-new PDF that contains **copies of the chosen pages** from the source. The pages travel with their fonts, images and vector content, so nothing is re-rendered and quality is unchanged. The original file is not modified. Output files are named after the source with the page span added, so `report.pdf` split at pages 1 to 3 becomes `report-p1-3.pdf`.',
    },
    {
      term: 'What a page range is',
      definition:
        'A range is written as a start and an end page joined by a hyphen, counting the first physical page as 1: `1-3` is pages one to three, `5` is a single page and `7-` runs from page seven to the end. Separate ranges with commas and each one becomes its own file. Pages you leave out of every range are simply not included in any output.',
    },
  ],
  whyHeading: 'Why split a PDF in the browser?',
  why: [
    { h: 'Send only the relevant part', x: 'Share one chapter of a report or one statement from a yearly bundle instead of the whole document, which keeps the reader focused and the attachment small.' },
    { h: 'Stay under attachment limits', x: 'Most mail servers cap attachments at around 20 to 25 MB. Splitting a large scan into halves gets it through without lowering image quality.' },
    { h: 'Nothing is re-encoded', x: 'Pages are copied, not printed to images, so the split files look and search exactly like the original.' },
    { h: 'Private for sensitive documents', x: 'Bank statements, payslips and contracts stay in the tab. There is no upload, no account and nothing left on a server.' },
    { h: 'All the pieces in one download', x: 'A split into forty single pages does not mean forty clicks. Download ZIP collects every output into one archive.' },
  ],
  howHeading: 'How to split a PDF, step by step',
  how: [
    { h: 'Open Split PDF and drop your file.', x: 'Drag one PDF onto the drop zone or click to browse. The options panel appears on the right.' },
    { h: 'Choose how to split.', x: 'Under Split by, pick **Custom ranges** for exact page spans, **Every N pages** for equal chunks, or **Every page** to get one file per page.' },
    { h: 'Type the ranges or the chunk size.', x: 'For Custom ranges, enter something like `1-3, 4-6, 7-` in the Ranges field; `7-` means page seven to the end. For Every N pages, set N pages per file, for example 2 for double-page spreads.' },
    { h: 'Click Run Split PDF.', x: 'The pieces are built in your browser and the progress bar counts them. A range that matches no page is skipped, and you are told if no range was valid.' },
    { h: 'Download the parts.', x: 'Every output appears in the Ready list. Use Download ZIP to get all of them in one archive, or download each file on its own. Names carry the page span, such as `invoice-p4-6.pdf`.' },
  ],
  faqs: [
    {
      q: 'Can I split a PDF into individual pages?',
      a: 'Yes. Choose Every page under Split by and run. Each page becomes its own PDF, named with its page number, and Download ZIP collects them all in one archive. For a document of a few hundred pages this takes a few seconds in a desktop browser.',
    },
    {
      q: 'Does splitting a PDF reduce quality?',
      a: 'No. Every page is copied into the new file together with its fonts and images. Nothing is rasterised or recompressed, so text stays selectable and pictures keep their resolution. The only things that do not carry over are document-level extras such as bookmarks, which belong to the whole file rather than to a page.',
    },
    {
      q: 'Can I pull out just one section instead of splitting everything?',
      a: 'Yes. Enter a single range such as `12-18` under Custom ranges and you get one file with those pages. If you want several non-adjacent pages in one output rather than one file per range, use [Extract Pages](/tools/extract-pages) instead, which accepts a list like `1, 4, 9-10`.',
    },
    {
      q: 'What happens to pages I do not include in any range?',
      a: 'They are left out of every output. The original file on your disk is untouched, so nothing is lost; run the tool again with a different range if you need those pages. If you would rather remove pages than keep them, [Delete Pages](/tools/delete-pages) works the other way round.',
    },
    {
      q: 'Is there a file size limit?',
      a: 'There is no fixed limit because the work happens in your browser rather than on a server. The practical ceiling is the memory available to the tab. Files of a few hundred megabytes split fine on a laptop; on a phone, very large scans can be slow.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'pdf-lib', 'ZIP archive', 'Adobe Acrobat', 'macOS Preview'],
  keywords: ['split pdf', 'split pdf online free', 'split pdf into separate pages', 'split pdf by page range', 'split pdf every n pages', 'divide pdf into multiple files', 'split pdf without uploading'],
  metaTitle: 'Split PDF Online Free | Ranges, Every N Pages',
  metaDescription: 'Split PDF into page ranges, every N pages or single pages, free and in your browser. Nothing is uploaded; download the parts separately or as one ZIP.',
}

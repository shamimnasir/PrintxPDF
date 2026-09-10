import type { ToolContent } from './types'

export const epubToPdf: ToolContent = {
  slug: 'epub-to-pdf',
  answer:
    'EPUB to PDF turns an ebook into a PDF you can print and open anywhere. Drop the .epub, click Run, and our converter lays the book out on A4 pages with margins and page numbers. The cover, chapters, pictures and links are kept. Your file is deleted right after.',
  whatHeading: 'What are EPUB and PDF?',
  what: [
    {
      term: 'EPUB: an ebook with no fixed pages',
      definition:
        'EPUB is the most common ebook format. Apps such as Apple Books and Kobo read it. Inside, the book is stored as chapters of text and pictures, not as pages. The text re-wraps to fit whatever screen and font size you pick, so a chapter may be 10 pages on a phone and 4 on a tablet. That is handy for reading, but it means an EPUB has no page numbers of its own until something turns it into pages.',
    },
    {
      term: 'PDF: fixed pages that look the same everywhere',
      definition:
        'A PDF is the opposite. Every page has a set size, and every line sits in a fixed spot, so the file looks the same on any screen and on paper. Turning an EPUB into a PDF means picking a paper size and margins, then laying the chapters out on real pages. You gain page numbers you can print and quote. You lose the ability to change the font size later without converting again.',
    },
  ],
  whyHeading: 'Why convert EPUB to PDF?',
  why: [
    {
      h: 'Print the book, or part of it',
      x: 'Printers understand pages, not chapters that re-wrap. An A4 PDF with margins and numbered pages goes straight from your printer tray to a binder.',
    },
    {
      h: 'Open it where there is no ebook app',
      x: 'Every browser, office laptop and PDF viewer opens a PDF. EPUB still needs a separate reader app on Windows and on many work machines.',
    },
    {
      h: 'Quote and mark up by page number',
      x: 'Study groups, courses and reviewers refer to pages. The converted PDF has page numbers that are the same for everyone who receives it.',
    },
    {
      h: 'Keep a fixed archive copy',
      x: 'A PDF keeps the exact layout for the long term and cannot be quietly re-wrapped by a future app update. Pair it with [PDF to PDF/A](/tools/pdf-to-pdfa) for formal archiving.',
    },
    {
      h: 'Deleted the moment it is returned',
      x: 'The .epub is sent over a secure connection to our converter, laid out on pages, and deleted as soon as the PDF is sent back.',
    },
  ],
  howHeading: 'How to convert EPUB to PDF, step by step',
  how: [
    {
      h: 'Open EPUB to PDF and drop your .epub',
      x: 'Drag the ebook onto the drop zone or click to browse. One book at a time, up to 100 MB.',
    },
    {
      h: 'Run EPUB to PDF',
      x: 'Click **Run EPUB to PDF**. The file is sent over a secure connection to our converter, which lays it out on A4 pages with even margins, page numbers and the cover at its original proportions. Long books can take up to the 2 minute limit.',
    },
    {
      h: 'Download the PDF',
      x: 'The PDF downloads automatically and the upload is deleted from the server at once.',
    },
    {
      h: 'Optional: adjust the result',
      x: 'Pull out a few chapters with [Extract Pages](/tools/extract-pages) or shrink a book full of pictures with [Compress PDF](/tools/compress-pdf).',
    },
  ],
  faqs: [
    {
      q: 'Does the PDF keep the pictures, table of contents and links?',
      a: 'Yes. Cover art, pictures in the text, chapter headings, footnotes and links inside the book all survive. Chapters appear in the PDF as a clickable table of contents. If the EPUB includes its own fonts, they are used; otherwise our converter uses its standard fonts.',
    },
    {
      q: 'Can I choose the page size or font size?',
      a: 'Not at the moment. The tool lays every book out the same way: A4 pages, even margins and page numbers, with the book\'s own styles and fonts respected. That layout prints cleanly and reads well on a laptop or tablet.',
    },
    {
      q: 'Can I convert a copy-protected EPUB?',
      a: 'No. Books bought from a store often carry copy protection (called DRM) that ties them to one account or device, and our converter cannot open them. It reports the file as protected and returns nothing. Books without copy protection, which includes most from publishers, libraries and self-published authors, convert normally.',
    },
    {
      q: 'Is my ebook stored anywhere?',
      a: 'No. It is sent over a secure connection, converted on our server and deleted the moment the PDF is returned. We keep a count of how many conversions you have used this month, not your books.',
    },
    {
      q: 'What are the limits?',
      a: 'Files up to 100 MB and 2 minutes per conversion. The free plan gives you 5 server conversions a month, Pro 300 and the API plan 5,000. See [pricing](/pricing).',
    },
  ],
  entities: ['EPUB', 'EPUB 3', 'PDF', 'Ebook', 'Apple Books', 'Kobo', 'A4'],
  keywords: [
    'epub to pdf',
    'epub to pdf converter',
    'convert epub to pdf online',
    'epub to pdf with page numbers',
    'print an epub',
    'ebook to pdf',
  ],
  metaTitle: 'EPUB to PDF: Turn an Ebook into a Printable A4 PDF',
  metaDescription:
    'Convert EPUB to PDF online. The ebook is laid out on A4 pages with margins and page numbers, with the cover and chapters kept. Deleted right after download.',
}

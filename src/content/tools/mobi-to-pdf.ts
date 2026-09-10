import type { ToolContent } from './types'

export const mobiToPdf: ToolContent = {
  slug: 'mobi-to-pdf',
  answer:
    'MOBI to PDF turns a Kindle book (.mobi, .azw, .azw3 or .prc) into a PDF you can print and open anywhere. Drop the file, click Run, and our converter lays it out on A4 pages with margins and page numbers, then deletes your book. Copy-protected books cannot be converted.',
  whatHeading: 'What are MOBI, AZW3 and PDF?',
  what: [
    {
      term: 'MOBI: the original Kindle book format',
      definition:
        'MOBI is the ebook format the first Kindles used, and Amazon kept it for years. A .mobi (or .prc, or .azw with an Amazon wrapper) holds the book as chapters of text and pictures that re-wrap to fit the screen, not as fixed pages. It allows only simple formatting: no custom fonts and no real tables. Amazon has retired it for new books, so old MOBI files get harder to open each year.',
    },
    {
      term: 'AZW3: the newer Kindle format',
      definition:
        'AZW3 is the newer Kindle format Amazon introduced in 2011. It allows much richer formatting than MOBI: its own fonts, decorative first letters, tables and fixed-layout pages, and a file often carries a MOBI copy inside it for older devices. Books you copy onto a Kindle yourself are usually .azw3. Our converter reads both the old and the new format without needing the device.',
    },
    {
      term: 'PDF: fixed pages that look the same everywhere',
      definition:
        'A PDF fixes every line of text and every picture on a page of a set size, so the file looks the same in any viewer and on paper. Converting a Kindle book to PDF means choosing a paper size and margins and laying the chapters out on real pages. You gain page numbers, printing and a file that opens everywhere; you lose the ability to change the font size on the fly.',
    },
  ],
  whyHeading: 'Why convert MOBI or AZW3 to PDF?',
  why: [
    {
      h: 'Read Kindle books without a Kindle',
      x: 'MOBI and AZW3 need a Kindle device or app. A PDF opens in any browser, on a work laptop, on an e-reader from another brand and in every notes app.',
    },
    {
      h: 'Print chapters or the whole book',
      x: 'The PDF comes out on A4 with margins and page numbers, ready for a printer or a binder, which no Kindle format can do directly.',
    },
    {
      h: 'Quote pages that stay put',
      x: 'Kindle locations change with font size. A PDF has fixed page numbers that are the same for everyone you share it with, which matters for coursework and reviews.',
    },
    {
      h: 'Keep an archive copy of your own books',
      x: 'Books you copied on yourself and self-published books in the old MOBI form become harder to open each year. A PDF is a stable, widely supported copy.',
    },
    {
      h: 'Nothing is stored',
      x: 'The file goes over a secure connection to our converter, is laid out on pages, and is deleted the instant the PDF is returned.',
    },
  ],
  howHeading: 'How to convert MOBI to PDF, step by step',
  how: [
    {
      h: 'Open MOBI to PDF and drop your Kindle file',
      x: 'Drag a .mobi, .azw, .azw3 or .prc file onto the drop zone. One book at a time, up to 100 MB.',
    },
    {
      h: 'Run MOBI to PDF',
      x: 'Click **Run MOBI to PDF**. The book is sent over a secure connection to our converter, which lays it out on A4 pages with even margins, page numbers and the cover at its original proportions. Long books may take up to the 2 minute limit.',
    },
    {
      h: 'Download the PDF',
      x: 'The PDF downloads automatically and your upload is deleted from the server straight away.',
    },
    {
      h: 'Optional: split or shrink it',
      x: 'Use [Split PDF](/tools/split-pdf) to break a long book into parts, or [Compress PDF](/tools/compress-pdf) if it is heavy with pictures.',
    },
  ],
  faqs: [
    {
      q: 'Can I convert a book I bought from the Kindle Store?',
      a: 'Only if it has no copy protection. Most Kindle Store purchases carry copy protection (called DRM) that ties them to your Amazon account, and our converter cannot open them: it detects the protection and returns an error instead of a file. Books you copied on yourself, self-published books and any book without protection convert normally.',
    },
    {
      q: 'Which Kindle formats are supported?',
      a: 'MOBI, PRC, AZW and AZW3. All four are read by our converter. KFX, the newest format that current Kindle apps use for store purchases, is not supported.',
    },
    {
      q: 'Will the cover, pictures and chapters be kept?',
      a: 'Yes. The cover comes first at its original proportions, pictures stay with their text, and chapter headings become entries in the PDF\'s clickable table of contents. Fonts stored inside an AZW3 are used where possible.',
    },
    {
      q: 'Can I change the page size or margins?',
      a: 'Not yet. Every book is laid out the same way: A4 paper, even margins and page numbers. That layout prints well and reads comfortably on a laptop or tablet screen.',
    },
    {
      q: 'Is the file uploaded, and is it kept?',
      a: 'It is sent over a secure connection, because the conversion runs on our server, and it is deleted the moment the PDF is sent back. Files up to 100 MB; 5 free conversions a month, Pro 300, API 5,000, see [pricing](/pricing).',
    },
  ],
  entities: ['MOBI', 'AZW3', 'AZW', 'Amazon Kindle', 'Kindle ebook', 'PDF'],
  keywords: [
    'mobi to pdf',
    'azw3 to pdf',
    'kindle to pdf converter',
    'convert mobi to pdf online',
    'azw to pdf',
    'read kindle books as pdf',
  ],
  metaTitle: 'MOBI to PDF: Convert Kindle AZW3, AZW and MOBI Files',
  metaDescription:
    'Convert MOBI, AZW and AZW3 Kindle books to PDF online. A4 pages with page numbers, cover and chapters kept, and your book is deleted right after download.',
}

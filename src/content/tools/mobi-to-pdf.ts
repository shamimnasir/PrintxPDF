import type { ToolContent } from './types'

export const mobiToPdf: ToolContent = {
  slug: 'mobi-to-pdf',
  answer:
    'Convert MOBI to PDF by dropping a .mobi, .azw, .azw3 or .prc Kindle file into MOBI to PDF and clicking Run. Our server typesets it with Calibre on A4 pages with margins and page numbers, returns the PDF and deletes your book immediately. DRM-protected files cannot be converted.',
  whatHeading: 'What are MOBI, AZW3 and PDF?',
  what: [
    {
      term: 'What is a MOBI file?',
      definition:
        'MOBI is the original Mobipocket ebook format that Amazon adopted for the first Kindles. It packs reflowable HTML-like content, images and metadata into a single PalmDOC-style container with the extension .mobi or .prc, and .azw is the same format with a Kindle wrapper. MOBI supports only a small subset of formatting: no embedded fonts, limited CSS and no proper tables, which is why Amazon retired it for new books.',
    },
    {
      term: 'What is an AZW3 file?',
      definition:
        'AZW3 is Amazon\'s KF8 (Kindle Format 8) container, introduced with the Kindle Fire in 2011. It carries a much richer HTML5 and CSS3 layer than MOBI, with embedded fonts, drop caps, tables and fixed-layout pages, and a KF8 file often includes a MOBI fallback for older devices. Books sideloaded to a Kindle are usually .azw3, and Calibre reads both generations without the original device.',
    },
    {
      term: 'What is a PDF file?',
      definition:
        'PDF (ISO 32000) fixes every line of text and every image on a page of a set size, so the file looks the same in any viewer and on paper. Converting a Kindle book to PDF means choosing paper size and margins and typesetting the reflowable chapters onto real pages. You gain page numbers, printing and universal compatibility; you lose the ability to change the font size on the fly.',
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
      h: 'Cite pages that stay put',
      x: 'Kindle locations change with font size. A PDF has fixed page numbers that are the same for everyone you share it with, which matters for coursework and reviews.',
    },
    {
      h: 'Keep an archive copy of your own books',
      x: 'Sideloaded and self-published books in old MOBI form become harder to open each year. A PDF is a stable, widely supported copy.',
    },
    {
      h: 'Nothing is stored',
      x: 'The file goes over HTTPS to an isolated container, Calibre typesets it, and the upload is deleted the instant the PDF is returned.',
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
      x: 'Click **Run MOBI to PDF**. The book is sent over HTTPS to our converter, where Calibre lays it out on A4 pages with even margins, page numbers and the cover at its original proportions. Long books may take up to the 2 minute limit.',
    },
    {
      h: 'Download the PDF',
      x: 'The PDF downloads automatically and your upload is deleted from the server straight away.',
    },
    {
      h: 'Optional: split or shrink it',
      x: 'Use [Split PDF](/tools/split-pdf) to break a long book into parts, or [Compress PDF](/tools/compress-pdf) if it is heavy with illustrations.',
    },
  ],
  faqs: [
    {
      q: 'Can I convert a book I bought from the Kindle Store?',
      a: 'Only if it has no DRM. Most Kindle Store purchases are encrypted to your Amazon account, and the converter cannot open them: the server detects the DRM and returns an error instead of a file. Sideloaded, DRM-free and self-published books convert normally.',
    },
    {
      q: 'Which Kindle formats are supported?',
      a: 'MOBI, PRC, AZW and AZW3 (KF8). All four are read by Calibre on our server. KFX, the newer format used by current Kindle apps for store purchases, is not supported.',
    },
    {
      q: 'Will the cover, images and chapters be kept?',
      a: 'Yes. The cover is placed first at its original aspect ratio, inline images stay with their text, and chapter headings become entries in the PDF outline. Fonts embedded in an AZW3 are used where possible.',
    },
    {
      q: 'Can I change the page size or margins?',
      a: 'Not yet. Every book is typeset the same way: A4 paper, even margins and page numbers. That layout prints well and reads comfortably on a laptop or tablet screen.',
    },
    {
      q: 'Is the file uploaded, and is it kept?',
      a: 'It is uploaded over HTTPS, because Calibre runs on our server, and it is deleted the moment the PDF is sent back. Files up to 100 MB; 5 free conversions a month, Pro 300, API 5,000, see [pricing](/pricing).',
    },
  ],
  entities: ['MOBI', 'AZW3', 'KF8', 'Amazon Kindle', 'Calibre', 'PDF', 'Mobipocket'],
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
    'Convert MOBI, AZW and AZW3 to PDF on our server with Calibre. A4 pages with page numbers, cover and chapters kept, and your book is deleted after download.',
}

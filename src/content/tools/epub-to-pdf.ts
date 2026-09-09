import type { ToolContent } from './types'

export const epubToPdf: ToolContent = {
  slug: 'epub-to-pdf',
  answer:
    'Convert EPUB to PDF by dropping the .epub into EPUB to PDF and clicking Run. Our server lays the book out with Calibre on A4 pages with margins and page numbers, keeps the cover, chapters, images and links, returns the PDF and deletes your file immediately.',
  whatHeading: 'What are EPUB and PDF?',
  what: [
    {
      term: 'What is an EPUB file?',
      definition:
        'EPUB is the open ebook standard from the W3C (formerly the IDPF). An .epub file is a ZIP archive containing XHTML chapters, CSS, images, fonts and a manifest that lists reading order and the table of contents. EPUB 3 adds audio, video and MathML. Its defining trait is reflow: text re-wraps to fit whatever screen and font size the reader chooses, so an EPUB has no fixed pages until a device or a converter decides on one.',
    },
    {
      term: 'What is a PDF file?',
      definition:
        'PDF (ISO 32000) is the opposite of reflowable: every page has a set size and every line sits at a fixed position, so the file prints and displays identically everywhere. Converting an EPUB to PDF therefore means choosing a paper size, margins and a base font, then typesetting the chapters onto pages. The result gains page numbers you can cite and print, and loses the ability to change font size without re-converting.',
    },
  ],
  whyHeading: 'Why convert EPUB to PDF?',
  why: [
    {
      h: 'Print the book, or part of it',
      x: 'Printers understand pages, not reflowable chapters. An A4 PDF with margins and numbered pages goes straight from your printer tray to a binder.',
    },
    {
      h: 'Open it where there is no ebook app',
      x: 'Every browser, office laptop and PDF viewer opens a PDF. EPUB still needs a dedicated reader app on Windows and on many work machines.',
    },
    {
      h: 'Cite and annotate by page number',
      x: 'Study groups, courses and reviewers refer to pages. The converted PDF has stable page numbers that are the same for everyone who receives it.',
    },
    {
      h: 'Keep a fixed archive copy',
      x: 'A PDF preserves the exact typesetting for the long term and cannot be quietly reflowed by a future app update. Pair it with [PDF to PDF/A](/tools/pdf-to-pdfa) for formal archiving.',
    },
    {
      h: 'Deleted the moment it is returned',
      x: 'The .epub travels over HTTPS to an isolated container, Calibre typesets it, and the upload is removed as soon as the PDF is sent back.',
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
      x: 'Click **Run EPUB to PDF**. The file is sent over HTTPS to our converter, where Calibre typesets it on A4 pages with even margins, page numbers and the cover kept at its original proportions. Long books can take up to the 2 minute limit.',
    },
    {
      h: 'Download the PDF',
      x: 'The PDF downloads automatically and the upload is deleted from the server at once.',
    },
    {
      h: 'Optional: adjust the result',
      x: 'Pull out a few chapters with [Extract Pages](/tools/extract-pages) or shrink an image-heavy book with [Compress PDF](/tools/compress-pdf).',
    },
  ],
  faqs: [
    {
      q: 'Does the PDF keep the images, table of contents and links?',
      a: 'Yes. Cover art, inline images, chapter headings, footnotes and internal links all survive the conversion, and chapters appear in the PDF outline. Embedded fonts are used when the EPUB includes them; otherwise Calibre falls back to the server fonts.',
    },
    {
      q: 'Can I choose the page size or font size?',
      a: 'Not at the moment. The tool typesets every book the same way: A4 pages, even margins and page numbers, with the book\'s own styles and fonts respected. That layout prints cleanly and reads well on a laptop or tablet.',
    },
    {
      q: 'Can I convert a DRM-protected EPUB?',
      a: 'No. Books bought with DRM from a store are encrypted to a specific account or device, and the converter cannot open them. The server reports the file as DRM-protected and returns nothing. DRM-free EPUBs, including most from publishers, libraries and self-published authors, convert normally.',
    },
    {
      q: 'Is my ebook stored anywhere?',
      a: 'No. It is uploaded over HTTPS, converted inside an isolated container and deleted the moment the PDF is returned. We keep a per-month usage counter, not your books.',
    },
    {
      q: 'What are the limits?',
      a: 'Files up to 100 MB and 2 minutes per conversion. The free plan gives you 5 server conversions a month, Pro 300 and the API plan 5,000. See [pricing](/pricing).',
    },
  ],
  entities: ['EPUB', 'EPUB 3', 'PDF', 'Calibre', 'W3C', 'Apple Books', 'Kobo', 'A4'],
  keywords: [
    'epub to pdf',
    'epub to pdf converter',
    'convert epub to pdf online',
    'epub to pdf with page numbers',
    'print an epub',
    'ebook to pdf',
  ],
  metaTitle: 'EPUB to PDF: Convert Ebooks to Printable A4 PDF',
  metaDescription:
    'Convert EPUB to PDF on our server with Calibre: A4 pages, margins, page numbers, cover and chapters kept. The ebook is deleted right after download.',
}

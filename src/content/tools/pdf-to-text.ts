import type { ToolContent } from './types'

export const pdfToText: ToolContent = {
  slug: 'pdf-to-text',
  answer:
    'PDF to Text pulls every line of text out of a PDF and saves it as a .txt file, with a marker between pages. It runs in your browser and the file is never uploaded. It reads the text layer only: a scanned PDF needs OCR first. Free, no sign-up.',
  whatHeading: 'What are PDF and plain text?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) draws each page from positioned text runs, images and vector shapes. When a PDF was made from a word processor it carries a text layer, where every glyph has a Unicode character behind it, and that is what a converter can extract. A PDF produced by a scanner is only a picture of the page and contains no text to pull out.',
    },
    {
      term: 'What is a TXT file?',
      definition:
        'A .txt file is plain text: characters and line breaks, nothing else. No fonts, colours, images or page sizes, which is exactly why it is so useful. It opens in every editor ever made, is tiny, searchable with any tool, easy to paste into a spreadsheet, a script or an AI prompt, and can be read by software that has never heard of PDF. This tool writes UTF-8, so accented and non-Latin characters survive.',
    },
  ],
  whyHeading: 'Why convert PDF to text?',
  why: [
    { h: 'Search and quote without a viewer', x: 'A .txt file is grep-able, diff-able and searchable in any editor. Find every mention of a clause in a 300-page report in seconds.' },
    { h: 'Feed documents to other tools', x: 'Scripts, spreadsheets, translation tools and AI assistants take plain text. Extract once and paste anywhere.' },
    { h: 'Reuse the words, not the layout', x: 'When you need the content of a PDF for a new document, plain text gives you clean sentences without the formatting baggage.' },
    { h: 'Private, fast, offline', x: 'Extraction uses **pdf.js** inside your browser. Nothing is uploaded, there is no queue, and it works on a train once the page has loaded.' },
  ],
  howHeading: 'How to convert PDF to text, step by step',
  how: [
    { h: 'Open PDF to Text and drop your PDF', x: 'Drag the file onto the drop zone, or click to choose it. The PDF is read locally.' },
    { h: 'Run PDF to Text', x: 'There are no options. Click **Run PDF to Text** and the progress bar walks through the pages.' },
    { h: 'Download the .txt file', x: 'The file downloads automatically, named after the PDF. Each page starts with a `--- Page N ---` line so you can tell where one page ends and the next begins.' },
    { h: 'Got an empty file? Run OCR first', x: 'If the PDF is a scan or a photo, there is no text layer to read. Use [OCR PDF](/tools/ocr-pdf) to make it searchable, then convert the result.' },
  ],
  faqs: [
    { q: 'Why is my text file empty or almost empty?', a: 'The PDF has no text layer, which usually means it was scanned or exported as images. Run it through [OCR PDF](/tools/ocr-pdf) first; the OCR tool recognises the characters and can give you the text directly.' },
    { q: 'Does PDF to Text keep the formatting?', a: 'No, and that is the point of plain text. Bold, fonts, colours and images are dropped. Lines are kept in reading order and pages are separated by a marker line. Multi-column pages may interleave lines, since the text layer does not always record column order.' },
    { q: 'Is my PDF uploaded to a server?', a: 'No. The text is extracted with pdf.js inside your browser tab and written to a file there. Contracts, statements and drafts never leave your computer, and nothing is stored after you close the tab.' },
    { q: 'Can I extract text from a specific page?', a: 'The tool always extracts the whole document, but every page starts with a `--- Page N ---` marker, so you can jump straight to the page you need in any text editor. To keep only certain pages, run [Extract Pages](/tools/extract-pages) first.' },
    { q: 'What about tables, Word or Markdown?', a: 'For a Word file use [PDF to Word](/tools/pdf-to-word), for a spreadsheet [PDF to Excel](/tools/pdf-to-excel), and for headings and lists as Markdown use [PDF to Markdown](/tools/pdf-to-markdown). All three are built on the same text extraction and share its limits.' },
  ],
  entities: ['PDF', 'ISO 32000', 'plain text', 'UTF-8', 'pdf.js', 'OCR'],
  keywords: ['pdf to text', 'convert pdf to text free', 'extract text from pdf', 'pdf to txt', 'pdf to text converter online', 'copy text from pdf', 'pdf text extractor'],
  metaTitle: 'PDF to Text: Extract All Text from a PDF Free',
  metaDescription: 'Convert PDF to text in your browser. Every line lands in a plain .txt file with page markers, ready to search, paste or reuse. Free, no upload, no sign-up.',
}

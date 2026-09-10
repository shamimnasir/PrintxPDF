import type { ToolContent } from './types'

export const pdfToText: ToolContent = {
  slug: 'pdf-to-text',
  answer:
    'PDF to Text pulls every line of text out of a PDF and saves it as a plain .txt file, with a marker between pages. It runs in your browser and the file is never uploaded. It only reads real text: a scanned PDF is a picture and needs OCR first. Free, no sign-up.',
  whatHeading: 'What are PDF and plain text?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'A PDF draws each page from text, pictures and shapes placed at fixed spots. When a PDF was made from a word processor, the text inside is real text: every letter is stored as a letter, and that is what a converter can pull out. A PDF made by a scanner or a camera is only a picture of the page and contains no text to pull out.',
    },
    {
      term: 'What is a TXT file?',
      definition:
        'A .txt file is plain text: letters and line breaks, nothing else. No fonts, colours, pictures or page sizes, which is exactly why it is so useful. It opens in every text editor, is tiny, easy to search, and simple to paste into a spreadsheet, a note or an AI prompt. This tool saves it in a way that keeps accented and non-English letters intact.',
    },
  ],
  whyHeading: 'Why convert PDF to text?',
  why: [
    { h: 'Search and quote without a PDF app', x: 'A .txt file can be searched and compared in any text editor. Find every mention of a clause in a 300-page report in seconds.' },
    { h: 'Feed documents to other tools', x: 'Spreadsheets, translation tools and AI assistants take plain text. Pull the text out once and paste it anywhere.' },
    { h: 'Reuse the words, not the layout', x: 'When you need the content of a PDF for a new document, plain text gives you clean sentences without the formatting baggage.' },
    { h: 'Private, fast, offline', x: 'The text is read inside your browser. Nothing is uploaded, there is no waiting line, and it works on a train once the page has loaded.' },
  ],
  howHeading: 'How to convert PDF to text, step by step',
  how: [
    { h: 'Open PDF to Text and drop your PDF', x: 'Drag the file onto the drop zone, or click to choose it. The PDF is read on your own computer.' },
    { h: 'Run PDF to Text', x: 'There are no options. Click **Run PDF to Text** and the progress bar walks through the pages.' },
    { h: 'Download the .txt file', x: 'The file downloads on its own, named after the PDF. Each page starts with a `--- Page N ---` line so you can tell where one page ends and the next begins.' },
    { h: 'Got an empty file? Run OCR first', x: 'If the PDF is a scan or a photo, there is no real text to read. Use [OCR PDF](/tools/ocr-pdf), which turns a picture of text into real text you can search and copy, then convert the result.' },
  ],
  faqs: [
    { q: 'Why is my text file empty or almost empty?', a: 'The PDF has no real text in it, which usually means it was scanned or saved as pictures. Run it through [OCR PDF](/tools/ocr-pdf) first. OCR reads the letters in the picture and turns them into real text; the OCR tool can give you the text directly.' },
    { q: 'Does PDF to Text keep the formatting?', a: 'No, and that is the point of plain text. Bold, fonts, colours and pictures are dropped. Lines are kept in reading order and pages are separated by a marker line. Pages with several columns may mix lines up, because the PDF does not always record which column comes first.' },
    { q: 'Is my PDF uploaded to a server?', a: 'No. The text is read and the file is written inside your browser tab. Contracts, statements and drafts never leave your computer, and nothing is stored after you close the tab.' },
    { q: 'Can I get the text from a specific page?', a: 'The tool always converts the whole document, but every page starts with a `--- Page N ---` marker, so you can jump straight to the page you need in any text editor. To keep only certain pages, run [Extract Pages](/tools/extract-pages) first.' },
    { q: 'What about tables, Word or Markdown?', a: 'For a Word file use [PDF to Word](/tools/pdf-to-word), for a spreadsheet [PDF to Excel](/tools/pdf-to-excel), and for headings and lists in a plain-text notes format use [PDF to Markdown](/tools/pdf-to-markdown). All three read the text the same way and share the same limits.' },
  ],
  entities: ['PDF', 'Plain text', 'TXT file', 'Text extraction', 'OCR'],
  keywords: ['pdf to text', 'convert pdf to text free', 'extract text from pdf', 'pdf to txt', 'pdf to text converter online', 'copy text from pdf', 'pdf text extractor'],
  metaTitle: 'PDF to Text: Pull All the Text Out of a PDF Free',
  metaDescription: 'Convert PDF to text in your browser. Every line lands in a plain .txt file with page markers, ready to search, paste or reuse. Free, no upload, no sign-up.',
}

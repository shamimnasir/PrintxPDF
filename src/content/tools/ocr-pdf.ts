import type { ToolContent } from './types'

export const ocrPdf: ToolContent = {
  slug: 'ocr-pdf',
  answer:
    'OCR PDF turns a scanned PDF or photo into searchable, selectable text. Tesseract runs in your browser through WebAssembly, so the file never leaves your device. You get a plain .txt file and a searchable PDF with an invisible text layer, free, with no sign-up.',
  whatHeading: 'What is OCR?',
  what: [
    {
      term: 'What is OCR?',
      definition:
        'Optical character recognition (OCR) is software that looks at the pixels of a scanned page or photo, finds the shapes of letters and turns them back into text a computer can search, copy and index. A scanner only produces a picture; OCR gives that picture its words back. This tool uses **Tesseract**, the open-source engine behind many document pipelines, compiled to WebAssembly so it runs entirely on your device.',
    },
    {
      term: 'What is a searchable PDF?',
      definition:
        'A searchable PDF keeps the scanned image on the page and adds an **invisible text layer** positioned over the printed words. Viewers still show the scan, but Ctrl+F, copy and paste, screen readers and search indexes read the hidden layer underneath. This is the standard way archives and law firms make scanned records findable without retyping them.',
    },
  ],
  whyHeading: 'Why OCR a scanned PDF?',
  why: [
    { h: 'Find any line in seconds', x: 'A 30-page scan with no text layer has to be read page by page. After OCR, searching for a name, invoice number or clause takes one keystroke in any PDF viewer.' },
    { h: 'Copy text instead of retyping it', x: 'Paste addresses, tables and paragraphs from old paperwork straight into email, spreadsheets or a contract draft. The .txt download gives you the whole document in one editable file.' },
    { h: 'Nothing leaves your computer', x: 'Contracts, medical records and ID scans are the documents people most often need to OCR, and the ones they least want on a stranger\'s server. Recognition runs on your own CPU; the only download is the language pack.' },
    { h: 'Make scans accessible and indexable', x: 'Screen readers, search appliances and AI assistants all rely on a text layer. A searchable PDF turns a dead image into a document they can actually read.' },
    { h: 'Feed other tools', x: 'Once a scan has text, [PDF to Markdown](/tools/pdf-to-markdown), [PDF to Word](/tools/pdf-to-word) and [PDF to Text](/tools/pdf-to-text) can work on it too.' },
  ],
  howHeading: 'How to OCR a PDF, step by step',
  how: [
    { h: 'Open OCR PDF and drop your scan', x: 'Drop a PDF, PNG or JPG onto the page. One file at a time; PDFs are processed up to 30 pages on the free plan and 200 on Pro.' },
    { h: 'Pick the language', x: 'Choose the document\'s language from the list: English, Bengali, Hindi, Arabic, Spanish, French, German, Portuguese, Russian, Japanese, Chinese (simplified) or Korean. Matching the language matters more than anything else for accuracy.' },
    { h: 'Click Run OCR', x: 'The first run downloads a language pack of about 10 MB and caches it, so later runs start immediately. A progress bar shows each page as it is recognised.' },
    { h: 'Check the recognised text', x: 'The text appears on the page with a Copy button. Skim it for misreads, which usually come from skewed scans or very small print.' },
    { h: 'Download the results', x: 'Under Downloads you get `name-ocr.txt` with all the text and `name-searchable.pdf`, the scan with an invisible text layer.' },
  ],
  faqs: [
    {
      q: 'Is OCR PDF free, and does it upload my file?',
      a: 'It is free, with no account. Recognition runs inside your browser using Tesseract compiled to WebAssembly, so the scan itself never leaves your computer. The one network request is the language pack, which is downloaded once and cached.',
    },
    {
      q: 'How many pages can I OCR at once?',
      a: 'Up to 30 pages per PDF on the free plan and 200 on Pro. Longer files are processed up to that limit and the result tells you how many pages were covered. Split a long scan first with [Split PDF](/tools/split-pdf) if you need every page.',
    },
    {
      q: 'Does OCR work on handwriting?',
      a: 'Not reliably. Tesseract is trained on printed type. Neat block capitals sometimes come through, but cursive handwriting will mostly produce noise. For printed documents, a straight scan at 300 dpi in the correct language gives the best results.',
    },
    {
      q: 'Can I search the PDF in languages other than English?',
      a: 'The .txt file holds the full recognised text in every supported language. The invisible layer inside the searchable PDF uses a standard Latin font, so for scripts such as Bengali, Arabic or Chinese, search inside the PDF is limited; use the .txt for those languages.',
    },
    {
      q: 'Is the searchable PDF identical to my original?',
      a: 'It is a rebuilt copy: each page is re-rendered as an image with the text layer laid over it. Links, bookmarks and form fields from the original are not carried across, and the file size will differ. Keep your original alongside it.',
    },
  ],
  entities: ['Tesseract', 'WebAssembly', 'Optical character recognition', 'Searchable PDF', 'Invisible text layer', 'Scanned PDF', 'Language pack'],
  keywords: ['ocr pdf', 'ocr pdf free', 'make scanned pdf searchable', 'searchable pdf', 'extract text from scanned pdf', 'image to text online', 'ocr without upload'],
  metaTitle: 'OCR PDF Free: Make a Scanned PDF Searchable in Your Browser',
  metaDescription: 'OCR PDF free: turn a scanned PDF or photo into searchable, selectable text with Tesseract running in your browser. No upload, no sign-up, 12 languages.',
}

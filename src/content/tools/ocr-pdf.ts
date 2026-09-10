import type { ToolContent } from './types'

export const ocrPdf: ToolContent = {
  slug: 'ocr-pdf',
  answer:
    'OCR PDF turns a scanned PDF or photo of text into real text you can search, select and copy. The recognition runs inside your browser, so the file never leaves your device. You get a plain .txt file and a searchable PDF, free, with no sign-up.',
  whatHeading: 'What is OCR?',
  what: [
    {
      term: 'OCR: turning a picture of text into real text',
      definition:
        'A scanner or a phone camera only produces a picture. The words in it are just dots, so you cannot search for them or copy them. OCR (short for optical character recognition) looks at those dots, spots the shapes of letters and turns them back into real text a computer can search, copy and index. This tool does that entirely on your own device, inside the browser tab.',
    },
    {
      term: 'Searchable PDF: the scan with hidden text underneath',
      definition:
        'A searchable PDF keeps the scanned picture on the page and adds an **invisible layer of real text** lined up over the printed words. You still see the scan, but Find, copy and paste, screen readers and search tools read the hidden text underneath. This is the standard way archives and law firms make scanned records findable without retyping them.',
    },
  ],
  whyHeading: 'Why OCR a scanned PDF?',
  why: [
    { h: 'Find any line in seconds', x: 'A 30-page scan with no real text has to be read page by page. After OCR, searching for a name, invoice number or clause takes one keystroke in any PDF viewer.' },
    { h: 'Copy text instead of retyping it', x: 'Paste addresses, tables and paragraphs from old paperwork straight into email, spreadsheets or a contract draft. The .txt download gives you the whole document in one editable file.' },
    { h: 'Nothing leaves your computer', x: 'Contracts, medical records and ID scans are the documents people most often need to OCR, and the ones they least want on a stranger\'s server. Recognition runs on your own computer; the only download is the language pack.' },
    { h: 'Make scans readable by other software', x: 'Screen readers, search tools and AI assistants all need real text. A searchable PDF turns a dead picture into a document they can actually read.' },
    { h: 'Feed other tools', x: 'Once a scan has real text, [PDF to Markdown](/tools/pdf-to-markdown), [PDF to Word](/tools/pdf-to-word) and [PDF to Text](/tools/pdf-to-text) can work on it too.' },
  ],
  howHeading: 'How to OCR a PDF, step by step',
  how: [
    { h: 'Open OCR PDF and drop your scan', x: 'Drop a PDF, PNG or JPG onto the page. One file at a time; PDFs are processed up to 30 pages on the free plan and 200 on Pro.' },
    { h: 'Pick the language', x: 'Choose the document\'s language from the list: English, Bengali, Hindi, Arabic, Spanish, French, German, Portuguese, Russian, Japanese, Chinese (simplified) or Korean. Matching the language matters more than anything else for accuracy.' },
    { h: 'Click Run OCR', x: 'The first run downloads a language pack of about 10 MB and keeps it for next time, so later runs start at once. A progress bar shows each page as it is recognised.' },
    { h: 'Check the recognised text', x: 'The text appears on the page with a Copy button. Skim it for misreads, which usually come from crooked scans or very small print.' },
    { h: 'Download the results', x: 'Under Downloads you get `name-ocr.txt` with all the text and `name-searchable.pdf`, the scan with the hidden text underneath.' },
  ],
  faqs: [
    {
      q: 'Is OCR PDF free, and does it upload my file?',
      a: 'It is free, with no account. Recognition runs inside your browser, so the scan itself never leaves your computer. The one thing fetched from the internet is the language pack, which is downloaded once and kept for next time.',
    },
    {
      q: 'How many pages can I OCR at once?',
      a: 'Up to 30 pages per PDF on the free plan and 200 on Pro. Longer files are processed up to that limit and the result tells you how many pages were covered. Split a long scan first with [Split PDF](/tools/split-pdf) if you need every page.',
    },
    {
      q: 'Does OCR work on handwriting?',
      a: 'Not reliably. The recognition is trained on printed type. Neat block capitals sometimes come through, but joined-up handwriting will mostly produce nonsense. For printed documents, a straight scan at the usual scanner sharpness (300 dots per inch) in the correct language gives the best results.',
    },
    {
      q: 'Can I search the PDF in languages other than English?',
      a: 'The .txt file holds the full recognised text in every supported language. The hidden text inside the searchable PDF uses a standard Western font, so for scripts such as Bengali, Arabic or Chinese, searching inside the PDF is limited; use the .txt for those languages.',
    },
    {
      q: 'Is the searchable PDF identical to my original?',
      a: 'It is a rebuilt copy: each page is redrawn as a picture with the hidden text laid over it. Links, bookmarks and fillable fields from the original are not carried across, and the file size will differ. Keep your original alongside it.',
    },
  ],
  entities: ['OCR', 'Optical character recognition', 'Searchable PDF', 'Scanned PDF', 'Text recognition', 'Language pack'],
  keywords: ['ocr pdf', 'ocr pdf free', 'make scanned pdf searchable', 'searchable pdf', 'extract text from scanned pdf', 'image to text online', 'ocr without upload'],
  metaTitle: 'OCR PDF Free: Make a Scanned PDF Searchable in Your Browser',
  metaDescription: 'OCR PDF free: turn a scanned PDF or photo into real text you can search, select and copy, all inside your browser. No upload, no sign-up, 12 languages.',
}

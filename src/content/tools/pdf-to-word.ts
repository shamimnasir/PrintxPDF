import type { ToolContent } from './types'

export const pdfToWord: ToolContent = {
  slug: 'pdf-to-word',
  answer:
    'PDF to Word extracts the text of a PDF into an editable .docx file, built in your browser. It is a best-effort, text-only conversion: every line becomes a paragraph, and images, columns, tables and the original layout are not preserved. Nothing is uploaded and no sign-up is needed.',
  whatHeading: 'What are PDF and DOCX?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) stores each page as positioned text runs, images and vector shapes. It records where every glyph sits, not how the paragraphs, columns and tables were built, which is why turning a PDF back into an editable document is hard. Text can be read out of a PDF made from Word or a web page; a scanned PDF holds only pictures.',
    },
    {
      term: 'What is a DOCX file?',
      definition:
        'DOCX is the Microsoft Word format defined by **Office Open XML** (ISO/IEC 29500). A .docx is a ZIP archive of XML parts: the document body, styles, numbering and media. Unlike PDF, it describes paragraphs and runs rather than fixed positions, so Word, Google Docs and LibreOffice lay the text out afresh and you can edit anything. This tool writes a minimal .docx with one paragraph per line.',
    },
  ],
  whyHeading: 'Why convert PDF to Word?',
  why: [
    { h: 'Edit the words without retyping', x: 'When the original document is lost and only the PDF survives, a .docx gives you the text back in a form you can revise, reuse and share.' },
    { h: 'Work in the tool you know', x: 'Comments, track changes, spell-check and styles all live in Word and Google Docs. Get the content there and carry on.' },
    { h: 'Keep the file private', x: 'The text is extracted and the .docx assembled inside your browser. Nothing is uploaded, so legal drafts and personal records stay on your machine.' },
    { h: 'Honest about what you get', x: 'This is text extraction, not layout reconstruction. You know before you start that images, columns and tables will not come across, so there are no surprises.' },
  ],
  howHeading: 'How to convert PDF to Word, step by step',
  how: [
    { h: 'Open PDF to Word and drop your PDF', x: 'Drag the file onto the drop zone or click to choose it. The PDF is read locally with **pdf.js**.' },
    { h: 'Run PDF to Word', x: 'There are no options. Click **Run PDF to Word** and the progress bar walks through the pages.' },
    { h: 'Download the .docx', x: 'The file downloads automatically, named after the PDF. Each page begins with a bold **Page N** heading, and every extracted line is its own paragraph.' },
    { h: 'Tidy up in Word', x: 'Open the file in Word or Google Docs, join lines that wrapped inside a paragraph, and apply your own styles. For a scanned PDF, run [OCR PDF](/tools/ocr-pdf) first, then convert the searchable copy.' },
  ],
  faqs: [
    { q: 'Will PDF to Word keep my layout?', a: 'No. This is a text-only conversion: fonts, columns, tables, images, headers and footers are not reproduced. You get the words in reading order, one paragraph per line, with a heading marking each page. For a faithful layout, you need a desktop converter such as Adobe Acrobat or Microsoft Word itself.' },
    { q: 'Why are there so many short paragraphs?', a: 'A PDF stores lines, not paragraphs, so every line of the original becomes its own paragraph in the .docx. In Word, select the text and use Find and Replace to swap paragraph marks (`^p`) for spaces where lines should join.' },
    { q: 'Why is the Word file empty?', a: 'The PDF has no text layer, which means it is a scan or an image export. Run it through [OCR PDF](/tools/ocr-pdf) to recognise the characters, then convert the searchable PDF, or take the text straight from the OCR result.' },
    { q: 'Does it work with tables?', a: 'The cell text comes across as lines, but the table itself does not. If the numbers matter, try [PDF to Excel](/tools/pdf-to-excel), which splits each line on wide gaps into separate cells, then copy the cells into Word.' },
    { q: 'Is my PDF uploaded?', a: 'No. Extraction and the .docx build both happen in your browser tab, and there is no account or file history. Close the tab and nothing remains anywhere.' },
  ],
  entities: ['PDF', 'ISO 32000', 'DOCX', 'Office Open XML', 'ISO/IEC 29500', 'Microsoft Word', 'Google Docs', 'pdf.js'],
  keywords: ['pdf to word', 'convert pdf to word free', 'pdf to docx', 'pdf to word online', 'pdf to editable word', 'pdf to word without uploading', 'extract text from pdf to word'],
  metaTitle: 'PDF to Word: Convert PDF to Editable DOCX Free',
  metaDescription: 'Convert PDF to Word in your browser and get an editable .docx with the text in reading order. Text only, no layout or images, no upload, no sign-up, and free.',
}

import type { ToolContent } from './types'

export const pdfToWord: ToolContent = {
  slug: 'pdf-to-word',
  answer:
    'PDF to Word pulls the text out of a PDF and puts it into an editable Word file (.docx), built in your browser. It is a text-only conversion: every line becomes a paragraph, and pictures, columns, tables and the original layout are not kept. Nothing is uploaded and no sign-up is needed.',
  whatHeading: 'What are PDF and DOCX?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'A PDF stores each page as text, pictures and shapes at fixed spots. It records where every letter sits, not how the paragraphs, columns and tables were built, which is why turning a PDF back into an editable document is hard. Text can be read out of a PDF made from Word or a web page; a scanned PDF holds only pictures.',
    },
    {
      term: 'What is a DOCX file?',
      definition:
        'DOCX is the file type Microsoft Word uses. Unlike a PDF, it describes paragraphs and text rather than fixed positions, so Word, Google Docs and other writing apps lay the text out fresh and let you edit anything. This tool writes a simple .docx with one paragraph per line of the PDF.',
    },
  ],
  whyHeading: 'Why convert PDF to Word?',
  why: [
    { h: 'Edit the words without retyping', x: 'When the original document is lost and only the PDF survives, a .docx gives you the text back in a form you can revise, reuse and share.' },
    { h: 'Work in the tool you know', x: 'Comments, tracked changes, spell-check and styles all live in Word and Google Docs. Get the content there and carry on.' },
    { h: 'Keep the file private', x: 'The text is read and the .docx is built inside your browser. Nothing is uploaded, so legal drafts and personal records stay on your computer.' },
    { h: 'Honest about what you get', x: 'This pulls out the text; it does not rebuild the layout. You know before you start that pictures, columns and tables will not come across, so there are no surprises.' },
  ],
  howHeading: 'How to convert PDF to Word, step by step',
  how: [
    { h: 'Open PDF to Word and drop your PDF', x: 'Drag the file onto the drop zone or click to choose it. The PDF is read on your own computer.' },
    { h: 'Run PDF to Word', x: 'There are no options. Click **Run PDF to Word** and the progress bar walks through the pages.' },
    { h: 'Download the .docx', x: 'The file downloads on its own, named after the PDF. Each page begins with a bold **Page N** heading, and every line of text becomes its own paragraph.' },
    { h: 'Tidy up in Word', x: 'Open the file in Word or Google Docs, join lines that belong to the same paragraph, and apply your own styles. For a scanned PDF, run [OCR PDF](/tools/ocr-pdf) first, then convert the searchable copy.' },
  ],
  faqs: [
    { q: 'Will PDF to Word keep my layout?', a: 'No. This is a text-only conversion: fonts, columns, tables, pictures, headers and footers are not rebuilt. You get the words in reading order, one paragraph per line, with a heading marking each page. For a faithful layout, you need a desktop program such as Adobe Acrobat or Microsoft Word itself.' },
    { q: 'Why are there so many short paragraphs?', a: 'A PDF stores lines, not paragraphs, so every line of the original becomes its own paragraph in the .docx. In Word, select the text and use Find and Replace to swap paragraph marks (`^p`) for spaces where lines should join.' },
    { q: 'Why is the Word file empty?', a: 'The PDF has no real text, only a picture of the page, which means it was scanned or saved as images. Run it through [OCR PDF](/tools/ocr-pdf) first. OCR turns a picture of text into real text you can search and copy. Then convert that copy, or take the text straight from the OCR result.' },
    { q: 'Does it work with tables?', a: 'The words in the cells come across as lines, but the table itself does not. If the numbers matter, try [PDF to Excel](/tools/pdf-to-excel), which splits each line on wide gaps into separate cells, then copy the cells into Word.' },
    { q: 'Is my PDF uploaded?', a: 'No. Reading the text and building the .docx both happen in your browser tab, and there is no account or file history. Close the tab and nothing remains anywhere.' },
  ],
  entities: ['PDF', 'DOCX', 'Microsoft Word', 'Google Docs', 'Text extraction', 'Editable document'],
  keywords: ['pdf to word', 'convert pdf to word free', 'pdf to docx', 'pdf to word online', 'pdf to editable word', 'pdf to word without uploading', 'extract text from pdf to word'],
  metaTitle: 'PDF to Word: Convert PDF to Editable DOCX Free',
  metaDescription: 'Convert PDF to Word in your browser and get an editable .docx with the text in reading order. Text only, no layout or pictures, no upload, no sign-up, and free.',
}

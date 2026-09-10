import type { ToolContent } from './types'

export const wordToPdf: ToolContent = {
  slug: 'word-to-pdf',
  answer:
    'Word to PDF converts a .docx into a PDF in your browser, with headings, lists, tables and pictures laid out on A4 pages. Styles are simplified, and each page is saved as a picture rather than selectable text. No upload, no sign-up: the document never leaves your computer.',
  whatHeading: 'What are DOCX and PDF?',
  what: [
    {
      term: 'What is a DOCX file?',
      definition:
        'DOCX has been the standard Microsoft Word format since Word 2007. A .docx is really a small bundle of files holding the text, styles, numbering and pictures. The page layout is worked out each time the file is opened, which is why the same document can break across pages differently in Word, Google Docs and other word processors.',
    },
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format) fixes every page. Text, pictures and shapes have set positions, so the file looks identical on a phone, a Mac, a Windows PC and a printer. That fixed layout is what makes PDF the safe choice for anything you send out: nobody needs Word, nobody can accidentally retype a paragraph, and page one stays page one.',
    },
  ],
  whyHeading: 'Why convert Word to PDF?',
  why: [
    { h: 'Looks the same everywhere', x: 'A .docx lays itself out differently on every machine; a PDF does not. Send a PDF and the other person sees the pages exactly as you did, without needing Word installed.' },
    { h: 'Harder to change by accident', x: 'PDF apps open in view mode. A CV, quote or letter arrives as a finished document rather than an editable draft.' },
    { h: 'Ready for printing and uploads', x: 'Job portals, university systems and print shops ask for PDF. This tool gives you an A4 PDF from a .docx in one step.' },
    { h: 'Stays on your computer', x: 'The document is read and laid out inside the browser tab. Nothing is uploaded, so private drafts and personal letters stay private.' },
  ],
  howHeading: 'How to convert Word to PDF, step by step',
  how: [
    { h: 'Open Word to PDF and drop your .docx', x: 'Drag the file onto the drop zone or click to choose it. Only .docx is accepted; save an older .doc as .docx in Word first.' },
    { h: 'Run Word to PDF', x: 'There are no options to set. Click **Run Word to PDF** and watch the progress bar: the document is read, then laid out on A4 pages.' },
    { h: 'Download and check the pages', x: 'The PDF downloads automatically and is named after your document. Use **Open in a new tab** to look through the pages before you send it.' },
    { h: 'Need searchable text? Run OCR', x: 'The pages are stored as pictures. If the PDF must be searchable or you need to copy text from it, run it through [OCR PDF](/tools/ocr-pdf) afterwards.' },
  ],
  faqs: [
    { q: 'Will Word to PDF keep my formatting?', a: 'Partly. Headings, paragraphs, bold and italic, lists, tables, pictures and link text are converted; fonts are replaced with a standard set. Custom fonts, multiple columns, text boxes, headers, footers and page numbers are not reproduced, and page breaks may fall in different places than in Word.' },
    { q: 'Can I select or search text in the PDF?', a: 'No. Each page is drawn as a picture, so the text is not selectable and links are not clickable. For a searchable copy, run the result through [OCR PDF](/tools/ocr-pdf), which reads the words and adds an invisible, selectable copy of the text.' },
    { q: 'Does it support .doc, .odt or .rtf files?', a: 'Only .docx. Open an older .doc, an .odt or an .rtf in Word, Google Docs or another word processor, choose Save As or Download, pick Word (.docx), and convert that file.' },
    { q: 'Is my Word document uploaded?', a: 'No. The .docx is unpacked and converted by our converter inside your browser, and the PDF is drawn there too. Close the tab and nothing remains. There is no account and no file history.' },
    { q: 'Why does the file name appear at the top of the PDF?', a: 'The converter places the document name as a title on the first page, because .docx files rarely carry a title of their own. Rename the file before converting if you want a different heading, and it will be picked up.' },
  ],
  entities: ['Microsoft Word', 'DOCX', 'Office Open XML', 'PDF', 'Google Docs', 'A4 page'],
  keywords: ['word to pdf', 'convert word to pdf free', 'docx to pdf', 'word to pdf online', 'convert docx to pdf without uploading', 'word to pdf converter'],
  metaTitle: 'Word to PDF: Convert DOCX to PDF Free, No Upload',
  metaDescription: 'Convert Word to PDF in your browser. Drop a .docx, get an A4 PDF with headings, lists, tables and pictures in place. Free, no sign-up, never uploaded.',
}

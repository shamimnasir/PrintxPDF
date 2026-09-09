import type { ToolContent } from './types'

export const pdfToPpt: ToolContent = {
  slug: 'pdf-to-ppt',
  answer:
    'Convert a PDF to PowerPoint by dropping the file into PDF to PowerPoint and running it. Our server opens the PDF with the LibreOffice PDF import and saves a .pptx in which each page becomes a slide of editable text and drawing objects, then deletes your file immediately.',
  whatHeading: 'What are PDF and PPTX?',
  what: [
    {
      term: 'What is a PDF file?',
      definition:
        'PDF (Portable Document Format, ISO 32000) fixes text, fonts, vector graphics and images on pages of a set size, so a document looks the same on every screen and printer. That fixed layout is the point: a PDF is a finished page, not an editable outline. Text is stored as positioned runs of glyphs rather than as paragraphs, bullets or slides, which is why turning a PDF back into a presentation takes real conversion work and never recovers the original slide master.',
    },
    {
      term: 'What is a PPTX file?',
      definition:
        'PPTX is the presentation format Microsoft PowerPoint has used since 2007, part of Office Open XML (ISO 29500). A .pptx file is a ZIP archive holding one XML part per slide, plus layouts, masters, themes and the embedded pictures and fonts. Because every slide is described as objects (text boxes, shapes, pictures) rather than as a flat page, PowerPoint, Keynote, Google Slides and LibreOffice Impress can all open, edit and re-export it.',
    },
  ],
  whyHeading: 'Why convert PDF to PowerPoint?',
  why: [
    {
      h: 'Get an editable deck back when the original is gone',
      x: 'A PDF export is often the only copy left of a talk. Converting it gives you a .pptx you can retitle, reorder and update instead of rebuilding every slide from a screenshot.',
    },
    {
      h: 'Present from PowerPoint, not a PDF viewer',
      x: 'A .pptx gives you presenter view, speaker notes, timings and the projector setup your venue expects. A PDF in full-screen mode gives you page up and page down.',
    },
    {
      h: 'Reuse text, charts and images in a new deck',
      x: 'Once each page is a slide made of objects, you can copy a chart or a block of text straight into another presentation without redrawing or retyping it.',
    },
    {
      h: 'Nothing is kept on our side',
      x: 'The file travels over HTTPS to an isolated container, LibreOffice converts it, the result streams back and the upload is deleted at once. There is no library, no history and no account needed.',
    },
  ],
  howHeading: 'How to convert PDF to PowerPoint, step by step',
  how: [
    {
      h: 'Open PDF to PowerPoint and drop your PDF',
      x: 'Drag the .pdf onto the drop zone or click to browse. One file at a time, up to 100 MB.',
    },
    {
      h: 'Run PDF to PowerPoint',
      x: 'Click **Run PDF to PowerPoint**. The file is sent over HTTPS to our converter, where LibreOffice opens it with its PDF import filter and saves it as `pptx`. Most decks take a few seconds; the hard limit is 2 minutes.',
    },
    {
      h: 'Download the .pptx',
      x: 'The presentation downloads automatically when the conversion finishes, and the upload is deleted from the server the moment it is returned.',
    },
    {
      h: 'Tidy the slides in PowerPoint',
      x: 'Open the file, apply your theme, and merge any text boxes the import split apart. Fonts that were not embedded in the PDF may need swapping back to the originals.',
    },
  ],
  faqs: [
    {
      q: 'Will the PowerPoint slides be fully editable?',
      a: 'Partly. Each PDF page becomes one slide made of text boxes, shapes and pictures positioned where they were on the page, so you can edit and move every piece. It is a set of editable drawings, not a reconstructed deck: slide masters, bullet hierarchies, animations and speaker notes are not recovered, and a paragraph may arrive as several boxes.',
    },
    {
      q: 'Why do the fonts look different after conversion?',
      a: 'Our server substitutes a similar typeface for any font that was not embedded in the PDF. The text stays editable, so pick the original font in PowerPoint and the layout usually snaps back. Fonts that were embedded are kept by name.',
    },
    {
      q: 'Does a scanned PDF convert to editable slides?',
      a: 'No. A scanned page is a picture, so each slide will contain that picture and no editable text. Run [OCR PDF](/tools/ocr-pdf) first if you need the words, then convert the result.',
    },
    {
      q: 'Is my PDF stored on your server?',
      a: 'No. It is uploaded over HTTPS, converted inside an isolated container and deleted the moment the .pptx is sent back. We keep a usage counter, not files.',
    },
    {
      q: 'How many PDFs can I convert, and how large?',
      a: 'Files up to 100 MB, with 2 minutes of conversion time each. The free plan covers 5 server conversions a month, Pro 300 and the API plan 5,000. See [pricing](/pricing) for details.',
    },
  ],
  entities: ['PDF', 'PPTX', 'Microsoft PowerPoint', 'LibreOffice Impress', 'Office Open XML', 'ISO 32000', 'Google Slides'],
  keywords: [
    'pdf to powerpoint',
    'pdf to ppt converter',
    'convert pdf to pptx',
    'pdf to powerpoint editable',
    'turn pdf into slides',
    'pdf to pptx online',
  ],
  metaTitle: 'PDF to PowerPoint: Convert PDF to Editable PPTX Slides',
  metaDescription:
    'Convert PDF to PowerPoint on our server with LibreOffice. Each page becomes an editable PPTX slide and the file is deleted after download. Free for 5 a month.',
}

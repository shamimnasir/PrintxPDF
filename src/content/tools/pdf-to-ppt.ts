import type { ToolContent } from './types'

export const pdfToPpt: ToolContent = {
  slug: 'pdf-to-ppt',
  answer:
    'Convert a PDF to PowerPoint by dropping the file into PDF to PowerPoint and clicking Run. Our converter opens the PDF and saves a .pptx in which each page becomes a slide made of text boxes and shapes you can edit. Your file is deleted as soon as the slides are sent back.',
  whatHeading: 'What are PDF and PPTX?',
  what: [
    {
      term: 'What is a PDF file?',
      definition:
        'A PDF fixes text, fonts, pictures and shapes on pages of a set size, so a document looks the same on every screen and printer. That fixed layout is the point: a PDF is a finished page, not an editable outline. It does not remember paragraphs, bullets or slides, which is why turning a PDF back into a presentation takes real work and never brings back the original slide design.',
    },
    {
      term: 'What is a PPTX file?',
      definition:
        'PPTX is the file type Microsoft PowerPoint has used since 2007. Every slide is stored as separate objects, such as text boxes, shapes and pictures, rather than as one flat page. That is what makes it editable. PowerPoint, Keynote, Google Slides and other presentation apps can all open, change and save it.',
    },
  ],
  whyHeading: 'Why convert PDF to PowerPoint?',
  why: [
    {
      h: 'Get an editable deck back when the original is gone',
      x: 'A PDF is often the only copy left of a talk. Converting it gives you a .pptx you can retitle, reorder and update instead of rebuilding every slide from a screenshot.',
    },
    {
      h: 'Present from PowerPoint, not a PDF app',
      x: 'A .pptx gives you presenter view, speaker notes, timings and the projector setup your venue expects. A PDF in full-screen mode gives you page up and page down.',
    },
    {
      h: 'Reuse text, charts and pictures in a new deck',
      x: 'Once each page is a slide made of objects, you can copy a chart or a block of text straight into another presentation without redrawing or retyping it.',
    },
    {
      h: 'Nothing is kept on our side',
      x: 'The file travels over a secure connection to our converter, the slides come back, and the upload is deleted at once. There is no library, no history and no account needed.',
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
      x: 'Click **Run PDF to PowerPoint**. The file is sent over a secure connection to our converter, which opens it and saves it as `pptx`. Most decks take a few seconds; the hard limit is 2 minutes.',
    },
    {
      h: 'Download the .pptx',
      x: 'The presentation downloads on its own when the conversion finishes, and the upload is deleted from our server the moment it is returned.',
    },
    {
      h: 'Tidy the slides in PowerPoint',
      x: 'Open the file, apply your theme, and join any text boxes the conversion split apart. Fonts that were not packed inside the PDF may need swapping back to the originals.',
    },
  ],
  faqs: [
    {
      q: 'Will the PowerPoint slides be fully editable?',
      a: 'Partly. Each PDF page becomes one slide made of text boxes, shapes and pictures placed where they were on the page, so you can edit and move every piece. It is a set of editable drawings, not a rebuilt deck: slide designs, bullet levels, animations and speaker notes do not come back, and a paragraph may arrive as several boxes.',
    },
    {
      q: 'Why do the fonts look different after conversion?',
      a: 'Our converter swaps in a similar font for any font that was not packed inside the PDF. The text stays editable, so pick the original font in PowerPoint and the layout usually snaps back. Fonts that were packed inside are kept by name.',
    },
    {
      q: 'Does a scanned PDF convert to editable slides?',
      a: 'No. A scanned page is a picture, so each slide will contain that picture and no editable text. Run [OCR PDF](/tools/ocr-pdf) first if you need the words. OCR turns a picture of text into real text you can search and copy. Then convert the result.',
    },
    {
      q: 'Is my PDF stored on your server?',
      a: 'No. It is uploaded over a secure connection, converted in a sealed-off space and deleted the moment the .pptx is sent back. We keep a usage counter, not files.',
    },
    {
      q: 'How many PDFs can I convert, and how large?',
      a: 'Files up to 100 MB, with 2 minutes of conversion time each. The free plan covers 5 server conversions a month, Pro 300 and the API plan 5,000. See [pricing](/pricing) for details.',
    },
  ],
  entities: ['PDF', 'PPTX', 'Microsoft PowerPoint', 'Google Slides', 'Apple Keynote', 'Presentation slides'],
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
    'Convert PDF to PowerPoint with our converter. Each page becomes an editable PPTX slide and your file is deleted right after download. Free for 5 files a month.',
}

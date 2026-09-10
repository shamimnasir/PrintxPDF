import type { ToolContent } from './types'

export const pptToPdf: ToolContent = {
  slug: 'ppt-to-pdf',
  answer:
    'Convert PowerPoint to PDF by dropping a .pptx, .ppt, .pps, .ppsx or .odp file into PowerPoint to PDF and clicking Run. Our converter turns every slide into a page of one PDF that opens on any device, then deletes your upload as soon as the PDF is sent back.',
  whatHeading: 'What are PPTX and PDF?',
  what: [
    {
      term: 'What is a PPTX file?',
      definition:
        'PPTX is the file type Microsoft PowerPoint has used since 2007, and .ppt is its older cousin. It holds every slide as editable pieces: text boxes, shapes, pictures, notes and the slide design. It is built for editing and presenting, which means it only looks identical when the viewer has PowerPoint or a similar app, the same fonts installed, and the same version.',
    },
    {
      term: 'What is a PDF file?',
      definition:
        'A PDF stores each page as fixed text, shapes and pictures, with the fonts packed inside, so the file looks the same on phones, laptops, kiosks and printers without any of the original software. A deck saved as PDF is a set of finished pages: nobody can accidentally nudge a title, fonts cannot change, and any browser can open it. Animations and slide transitions are not part of a PDF.',
    },
  ],
  whyHeading: 'Why convert PowerPoint to PDF?',
  why: [
    {
      h: 'Send slides that look the same on every device',
      x: 'Fonts are packed inside and the layout is fixed, so the deck you email is the deck the other person sees, in a browser, on a phone, or on a computer without PowerPoint.',
    },
    {
      h: 'Share handouts nobody can edit by accident',
      x: 'A PDF is read-only in practice. Clients, students and reviewers can add notes to it, but they cannot drag a chart or retype a number and pass the deck on as yours.',
    },
    {
      h: 'Print reliably',
      x: 'PDF is what print shops and office printers handle best. Page size and colour survive the trip, which is rarely true when a .pptx is printed straight from a different computer.',
    },
    {
      h: 'Convert old .ppt, .pps and .odp files too',
      x: 'The same tool takes the older PowerPoint format, slideshow files and .odp files from free office suites, so a folder of mixed decks can be turned into PDFs without opening each one.',
    },
    {
      h: 'Your file is deleted right away',
      x: 'The upload goes over a secure connection to our converter, the PDF is made, and the original is removed the moment the PDF is returned.',
    },
  ],
  howHeading: 'How to convert PowerPoint to PDF, step by step',
  how: [
    {
      h: 'Open PowerPoint to PDF and drop your deck',
      x: 'Drag a .pptx, .ppt, .pps, .ppsx or .odp file onto the drop zone. One file at a time, up to 100 MB.',
    },
    {
      h: 'Run PowerPoint to PDF',
      x: 'Click **Run PowerPoint to PDF**. The deck is sent over a secure connection to our converter, which draws one page per slide.',
    },
    {
      h: 'Download the PDF',
      x: 'The finished PDF downloads on its own. Your original is deleted from our server as soon as it has been sent back.',
    },
    {
      h: 'Optional: protect or shrink it',
      x: 'Add a password with [Protect PDF](/tools/protect-pdf) before sending anything private, or run [Compress PDF](/tools/compress-pdf) if the deck is heavy with photos.',
    },
  ],
  faqs: [
    {
      q: 'Are animations and transitions kept in the PDF?',
      a: 'No. A PDF has no idea of slide animation, so each slide is saved in its finished state with every part visible. Speaker notes are not included either; the PDF contains the slides only.',
    },
    {
      q: 'Will my fonts look right?',
      a: 'Fonts that are packed inside the .pptx, or that our converter has installed, come out as designed. If the deck uses a font that is neither, our converter swaps in the closest match, which can move line breaks. Packing fonts into the deck when you save it avoids this.',
    },
    {
      q: 'Can I convert an old .ppt file or a .pps slideshow?',
      a: 'Yes. The tool accepts .ppt, .pps, .ppsx and .odp as well as .pptx, and our converter reads all of them. The result is the same fixed-layout PDF.',
    },
    {
      q: 'Is the deck uploaded, and what happens to it?',
      a: 'Yes, this conversion needs a real presentation program, so the file is sent over a secure connection to our converter, handled in a sealed-off space and deleted the moment the PDF is returned. Nothing is stored or reused.',
    },
    {
      q: 'What are the limits?',
      a: 'Files up to 100 MB and 2 minutes of conversion time. The free plan includes 5 server conversions a month, Pro 300 and the API plan 5,000. Details are on the [pricing](/pricing) page.',
    },
  ],
  entities: ['Microsoft PowerPoint', 'PPTX', 'PDF', 'Slide deck', 'OpenDocument Presentation', 'Google Slides'],
  keywords: [
    'powerpoint to pdf',
    'ppt to pdf converter',
    'convert pptx to pdf',
    'save powerpoint as pdf online',
    'pps to pdf',
    'odp to pdf',
  ],
  metaTitle: 'PowerPoint to PDF: Convert PPTX, PPT and ODP Online',
  metaDescription:
    'Convert PowerPoint to PDF with our converter. Every slide becomes a fixed page that opens anywhere, and your deck is deleted right after download. Free plan.',
}

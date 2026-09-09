import type { ToolContent } from './types'

export const pptToPdf: ToolContent = {
  slug: 'ppt-to-pdf',
  answer:
    'Convert PowerPoint to PDF by dropping a .pptx, .ppt, .pps, .ppsx or .odp file into PowerPoint to PDF and clicking Run. Our server renders every slide with LibreOffice Impress into a single PDF that opens on any device, then deletes your upload immediately.',
  whatHeading: 'What are PPTX and PDF?',
  what: [
    {
      term: 'What is a PPTX file?',
      definition:
        'PPTX is the Office Open XML presentation format (ISO 29500) used by Microsoft PowerPoint since 2007, and .ppt is its older binary ancestor. A .pptx file is a ZIP archive of XML parts, one per slide, plus layouts, masters, themes, notes and embedded media. It is built for editing and presenting, which means it depends on the viewer having PowerPoint or a compatible app, the same fonts installed and the same version of the layout engine to look identical.',
    },
    {
      term: 'What is a PDF file?',
      definition:
        'PDF (Portable Document Format, ISO 32000) stores each page as fixed text, vector graphics and images, with fonts embedded, so the file renders identically on phones, laptops, kiosks and printers without any of the original software. A deck saved as PDF is a sequence of finished pages: nobody can accidentally nudge a title, fonts cannot fall back, and any browser can open it. Animations and transitions are not part of the format.',
    },
  ],
  whyHeading: 'Why convert PowerPoint to PDF?',
  why: [
    {
      h: 'Send slides that look the same on every device',
      x: 'Fonts are embedded and layout is fixed, so the deck you email is the deck the recipient sees, in a browser, on a phone, or on a machine without PowerPoint.',
    },
    {
      h: 'Share handouts nobody can edit by accident',
      x: 'A PDF is read-only in practice. Clients, students and reviewers can annotate it, but they cannot drag a chart or retype a number and pass the deck on as yours.',
    },
    {
      h: 'Print reliably',
      x: 'PDF is what print shops and office printers handle best. Page size, bleed and colour survive the trip, which is rarely true when a .pptx is printed straight from a different machine.',
    },
    {
      h: 'Convert old .ppt, .pps and .odp files too',
      x: 'The same tool takes the legacy binary format, slideshow files and LibreOffice Impress .odp, so an archive of mixed decks can be turned into PDFs without opening each one.',
    },
    {
      h: 'Your file is deleted immediately',
      x: 'The upload goes over HTTPS to an isolated container, LibreOffice exports it, and the source is removed the moment the PDF is returned.',
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
      x: 'Click **Run PowerPoint to PDF**. The deck is sent over HTTPS to our converter and rendered by LibreOffice Impress, one page per slide.',
    },
    {
      h: 'Download the PDF',
      x: 'The finished PDF downloads on its own. Your original is deleted from the server as soon as it has been sent back.',
    },
    {
      h: 'Optional: protect or shrink it',
      x: 'Add a password with [Protect PDF](/tools/protect-pdf) before sending anything confidential, or run [Compress PDF](/tools/compress-pdf) if the deck is heavy with photos.',
    },
  ],
  faqs: [
    {
      q: 'Are animations and transitions kept in the PDF?',
      a: 'No. PDF has no concept of slide animation, so each slide is exported in its final state with every build step visible. Speaker notes are not included either; the PDF contains the slides only.',
    },
    {
      q: 'Will my fonts look right?',
      a: 'Fonts that are embedded in the .pptx, or that our server has installed, render as designed. If the deck uses a font that is neither, LibreOffice substitutes the closest match, which can shift line breaks. Embedding fonts when you save the deck avoids this.',
    },
    {
      q: 'Can I convert an old .ppt file or a .pps slideshow?',
      a: 'Yes. The tool accepts .ppt, .pps, .ppsx and .odp as well as .pptx, and LibreOffice reads all of them. The result is the same fixed-layout PDF.',
    },
    {
      q: 'Is the deck uploaded, and what happens to it?',
      a: 'Yes, this conversion needs a real presentation engine, so the file is sent over HTTPS to our converter, processed in an isolated container and deleted the moment the PDF is returned. Nothing is stored or reused.',
    },
    {
      q: 'What are the limits?',
      a: 'Files up to 100 MB and 2 minutes of conversion time. The free plan includes 5 server conversions a month, Pro 300 and the API plan 5,000. Details are on the [pricing](/pricing) page.',
    },
  ],
  entities: ['Microsoft PowerPoint', 'PPTX', 'PDF', 'LibreOffice Impress', 'Office Open XML', 'OpenDocument Presentation', 'ISO 32000'],
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
    'Convert PowerPoint to PDF on our server with LibreOffice. Every slide becomes a fixed page that opens anywhere, and your deck is deleted right after download.',
}

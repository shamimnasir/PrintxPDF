import type { ToolContent } from './types'

export const flattenPdf: ToolContent = {
  slug: 'flatten-pdf',
  answer:
    'Flatten PDF bakes the filled-in answers of a form into the page so they cannot be changed, and every viewer shows them the same way. Drop the file, click Run Flatten PDF, and the flattened copy downloads. It runs in your browser, free, with nothing uploaded.',
  whatHeading: 'What does flattening a PDF mean?',
  what: [
    {
      term: 'Flattening: the answers become part of the page',
      definition:
        'A fillable PDF keeps each box you type in as a separate live object floating over the page. Flattening draws what is in the box onto the page itself and removes the live box. What was a text field becomes plain printed text. The result looks identical but behaves like a sheet of paper: nothing can be clicked, changed or cleared by accident.',
    },
    {
      term: 'Fillable fields: why they look different in every app',
      definition:
        'Fillable fields are the text boxes, tick boxes, dropdowns and signature spaces in a form. The PDF file only stores what is in them; each viewer app draws them on the fly. That is why a freshly filled form sometimes looks different in another app, or shows empty boxes in a viewer that does not understand forms. Flattening removes that dependence on the viewer by turning the fields into ordinary page content.',
    },
  ],
  whyHeading: 'Why flatten a PDF?',
  why: [
    { h: 'Lock the answers', x: 'A completed application, timesheet or consent form should not be editable by the next person who opens it. Flattening freezes what was entered.' },
    { h: 'Look the same everywhere', x: 'Browser viewers, phone apps and printers handle live fields differently. Flattened content is ordinary page content and looks identical everywhere.' },
    { h: 'Print and archive reliably', x: 'Archives, the long-term PDF/A format and many submission portals want documents with no live parts. Flatten first, then convert with [PDF to PDF/A](/tools/pdf-to-pdfa).' },
    { h: 'Stop answers going missing', x: 'Some viewers drop what was typed into a form when they save or export. Flattened text cannot be lost that way.' },
    { h: 'Private and free', x: 'The file is processed in your browser. Nothing is uploaded and no account is needed.' },
  ],
  howHeading: 'How to flatten a PDF, step by step',
  how: [
    { h: 'Open Flatten PDF and drop your file', x: 'Drop the filled form or any PDF with fillable fields.' },
    { h: 'Click Run Flatten PDF', x: 'The tool finds every fillable field, draws what is in it onto the page and removes the field.' },
    { h: 'Download the result', x: 'The file arrives as `name-flat.pdf` with a note saying how many fields were flattened. If none were found, the file is simply saved again.' },
    { h: 'Check it', x: 'Open the copy in [PDF Reader](/tools/pdf-reader) and confirm the entries are visible and no longer clickable.' },
  ],
  faqs: [
    {
      q: 'Can I unflatten a PDF?',
      a: 'No. Flattening is one-way: the fields are gone and only their drawn appearance remains. Keep the fillable original if you may need to change answers later, and flatten a copy for sending.',
    },
    {
      q: 'Does flattening stop people editing the PDF?',
      a: 'It removes the fillable fields, so answers cannot be typed over. It is not a password or a lock; a PDF editor can still change what is on the page. To stop people opening or editing the file, add a password with [Protect PDF](/tools/protect-pdf) after flattening.',
    },
    {
      q: 'Does it flatten comments and highlights too?',
      a: 'This tool flattens fillable fields only. Sticky notes, highlights and other markup are left as they are. If you need those baked in too, print the file to PDF from a desktop viewer, which draws them into the page.',
    },
    {
      q: 'What about digitally signed forms?',
      a: 'Flattening changes the file, so a certificate-based digital signature already on it will show as invalid afterwards. Fill and flatten first, then sign. A drawn signature from [Sign PDF](/tools/sign-pdf) is unaffected because it is already part of the page.',
    },
    {
      q: 'It says no form fields were found, but my form has fields',
      a: 'The form is probably an older kind of form some government sites use, which stores its fields in a different way this tool cannot read. Print it to PDF from a desktop viewer such as Adobe Acrobat to get a flat copy.',
    },
  ],
  entities: ['Fillable PDF form', 'Form fields', 'Flattening', 'PDF', 'PDF/A', 'Adobe Acrobat'],
  keywords: ['flatten pdf', 'flatten pdf free', 'flatten pdf form fields', 'make pdf form non editable', 'flatten fillable pdf online', 'flatten pdf without acrobat'],
  metaTitle: 'Flatten PDF: Lock Form Answers into the Page, Free',
  metaDescription: 'Flatten a PDF free: bake the filled-in answers into the page so they cannot be edited and every viewer shows the same thing. Runs in your browser, no upload.',
}

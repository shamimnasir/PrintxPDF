import type { ToolContent } from './types'

export const flattenPdf: ToolContent = {
  slug: 'flatten-pdf',
  answer:
    'Flatten PDF bakes form fields into the page content, so the answers can no longer be edited and the pages display the same in every viewer. Drop the file, click Run Flatten PDF, and the flattened copy downloads. It runs in your browser, free, with nothing uploaded.',
  whatHeading: 'What does flattening a PDF mean?',
  what: [
    {
      term: 'What does flattening a PDF mean?',
      definition:
        'A fillable PDF keeps each field as a separate interactive object, an AcroForm field with a **widget annotation**, layered over the page. Flattening draws the field\'s current appearance into the page content itself and removes the interactive field. What was a text box becomes plain text on the page. The result looks identical but behaves like a printed sheet: nothing can be clicked, changed or accidentally cleared.',
    },
    {
      term: 'What is an AcroForm?',
      definition:
        '**AcroForm** is the form technology defined in the PDF specification (ISO 32000): text fields, checkboxes, radio buttons, dropdowns and signature fields, each with a widget that a viewer draws. Because the viewer draws them, freshly filled fields sometimes look different across applications, or vanish in a viewer that ignores forms. Flattening replaces that dependence on the viewer with fixed page content.',
    },
  ],
  whyHeading: 'Why flatten a PDF?',
  why: [
    { h: 'Lock the answers', x: 'A completed application, timesheet or consent form should not be editable by the next person who opens it. Flattening freezes what was entered.' },
    { h: 'Look the same everywhere', x: 'Browser viewers, phone apps and print drivers handle live fields differently. Flattened content is ordinary page content and renders identically.' },
    { h: 'Print and archive reliably', x: 'Archives, PDF/A conversion and many submission portals want documents without interactive elements. Flatten first, then convert with [PDF to PDF/A](/tools/pdf-to-pdfa).' },
    { h: 'Stop fields going missing', x: 'Some viewers drop form values when they save or re-export. Flattened text cannot be lost that way.' },
    { h: 'Private and free', x: 'The file is processed in your browser. Nothing is uploaded and no account is needed.' },
  ],
  howHeading: 'How to flatten a PDF, step by step',
  how: [
    { h: 'Open Flatten PDF and drop your file', x: 'Drop the filled form or any PDF with fields.' },
    { h: 'Click Run Flatten PDF', x: 'The tool finds every AcroForm field, draws its current appearance into the page and removes the field.' },
    { h: 'Download the result', x: 'The file arrives as `name-flat.pdf` with a note saying how many fields were flattened. If none were found, the file is simply re-saved.' },
    { h: 'Check it', x: 'Open the copy in [PDF Reader](/tools/pdf-reader) and confirm the entries are visible and no longer clickable.' },
  ],
  faqs: [
    {
      q: 'Can I unflatten a PDF?',
      a: 'No. Flattening is one-way: the fields are gone and only their drawn appearance remains. Keep the fillable original if you may need to change answers later, and flatten a copy for sending.',
    },
    {
      q: 'Does flattening stop people editing the PDF?',
      a: 'It removes the form fields, so answers cannot be typed over. It is not encryption or a permission lock; a PDF editor can still alter page content. To restrict opening or editing, add a password with [Protect PDF](/tools/protect-pdf) after flattening.',
    },
    {
      q: 'Does it flatten comments and highlights too?',
      a: 'This tool flattens form fields and their widgets. Sticky notes, highlights and other markup annotations are left as they are. If you need markup baked in, print the file to PDF from a desktop viewer, which renders annotations into the page.',
    },
    {
      q: 'What about digitally signed forms?',
      a: 'Flattening changes the file, so a certificate-based digital signature already on it will show as invalid afterwards. Fill and flatten first, then sign. A drawn signature from [Sign PDF](/tools/sign-pdf) is unaffected because it is already page content.',
    },
    {
      q: 'It says no form fields were found, but my form has fields',
      a: 'The form is probably XFA, an older XML-based format from LiveCycle Designer, which this tool does not read. Print it to PDF from a desktop viewer such as Adobe Acrobat to get a flat copy.',
    },
  ],
  entities: ['AcroForm', 'Form field', 'Widget annotation', 'Flattening', 'ISO 32000', 'XFA', 'PDF/A'],
  keywords: ['flatten pdf', 'flatten pdf free', 'flatten pdf form fields', 'make pdf form non editable', 'flatten fillable pdf online', 'flatten pdf without acrobat'],
  metaTitle: 'Flatten PDF: Lock Form Fields into the Page, Free',
  metaDescription: 'Flatten a PDF free: bake form fields into the page so answers cannot be edited and every viewer shows the same thing. Runs in your browser, no upload.',
}

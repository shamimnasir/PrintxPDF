import type { ToolContent } from './types'

export const pdfForms: ToolContent = {
  slug: 'pdf-forms',
  answer:
    'Fill PDF Forms finds the fillable fields inside a PDF, shows you a box, tick box, choice or list for each one, and saves your answers back into the file. Save filled keeps the answers editable; Save flattened locks them in place. Free, in your browser, with nothing uploaded.',
  whatHeading: 'What is a PDF form?',
  what: [
    {
      term: 'What is a fillable PDF form?',
      definition:
        'A fillable PDF form has real fields built into it: text boxes, tick boxes, round option buttons, dropdown menus and scrolling lists. Each field has a name and a saved answer, so a PDF app can show your answer and let you change it. This tool reads every field, gives you a matching control for each one, and writes your answers back into the file.',
    },
    {
      term: 'What is an older kind of form some government sites use?',
      definition:
        'Some forms, often from government or banking sites, are built with an older system that only a few PDF apps can display. Their fields are not standard fillable fields, so this tool cannot read them. Such a file shows as having no fillable fields. Many of these sites also offer a plain, print-ready version of the form as a standard PDF, which this tool handles.',
    },
    {
      term: 'What does flattening a form do?',
      definition:
        'Flattening bakes your filled-in answers into the page so they cannot be changed. The fields are removed and the answers become fixed ink, like a printed page. Nobody can edit or accidentally clear them later, which is usually what the person receiving the form wants. It is one-way, so keep the filled version if you may need to edit later.',
    },
  ],
  whyHeading: 'Why fill PDF forms in the browser?',
  why: [
    { h: 'No printing, no scanning', x: 'Type the answers, tick the boxes and download a clean file, instead of a photo of a printout.' },
    { h: 'Private answers stay on your computer', x: 'Tax, medical and job forms carry ID numbers and addresses. The fields are read and written inside your browser tab and nothing is uploaded.' },
    { h: 'Lock the answers before sending', x: 'Save flattened bakes the answers into the page, so nobody can quietly change a figure after you sign off.' },
    { h: 'Keep an editable version', x: 'Save filled leaves the fields live, so a form you fill every month can be reopened and updated instead of retyped.' },
    { h: 'Free, no account, no watermark', x: 'There is no page limit and nothing to install. Any current browser on a computer or phone works.' },
  ],
  howHeading: 'How to fill a PDF form, step by step',
  how: [
    { h: 'Open Fill PDF Forms and drop the form.', x: 'Drag the PDF onto the drop zone. A Reading fields badge shows while the form is read. A password-protected file shows a notice pointing you to [Unlock PDF](/tools/unlock-pdf); a file with no fields points you to [Edit PDF](/tools/edit-pdf), which lets you type anywhere.' },
    { h: 'Fill in each field.', x: 'Every field is listed by name with a badge for its type: Text (one line or several), Checkbox, Radio group (pick one) with a Clear button, Dropdown or Option list. Fields marked read-only, and buttons, are shown but left as they are.' },
    { h: 'Check the count in the Save panel.', x: 'The panel on the right tells you how many fields you can edit and how many already have an answer, so a missed box is easy to spot before saving.' },
    { h: 'Click Save filled or Save flattened.', x: '**Save filled** writes your answers and downloads `name-filled.pdf` with the fields still editable. **Save flattened** bakes the answers into the pages, removes the fields and downloads `name-flattened.pdf`. Flatten last, on a copy.' },
  ],
  faqs: [
    {
      q: 'Why does it say my PDF has no fillable form fields?',
      a: 'Because the boxes and lines you can see are just drawn shapes, not real fields. That is the case for scanned forms, forms saved as flat PDFs and the older kind of form some government sites use. You can still type on such a file with [Edit PDF](/tools/edit-pdf), which places text wherever you click.',
    },
    {
      q: 'Will the filled text look the same in every PDF app?',
      a: 'Nearly. Your answers are drawn in a plain standard font, so a form that asks for another font can look slightly different in the box. The answers themselves are saved correctly, and some apps redraw them in their own font. Flattening fixes the look into the page for good.',
    },
    {
      q: 'What is the difference between Save filled and Save flattened?',
      a: 'Save filled keeps the form live: your answers are stored in the fields and anyone with a PDF app can change them later. Save flattened bakes the answers into the page and deletes the fields, so nothing can be changed. Use filled while you are still working and flattened for the copy you send.',
    },
    {
      q: 'Can I fill a password-protected form?',
      a: 'Not until the password is removed. The tool refuses to read fields from a locked file on purpose, because writing answers into it would produce a broken document. Run it through [Unlock PDF](/tools/unlock-pdf) first, using the password you have, then fill it here.',
    },
    {
      q: 'Can I choose several items in an option list?',
      a: 'No. Lists that allow several choices are saved with one choice only, the one you pick. Dropdowns, option buttons and tick boxes work exactly as designed. Signature fields are shown but cannot be signed here; to add a picture of your signature, use [Sign PDF](/tools/sign-pdf).',
    },
  ],
  entities: ['Fillable PDF form', 'Form fields', 'Flattened PDF', 'PDF', 'Adobe Acrobat', 'macOS Preview'],
  keywords: ['fill pdf form', 'fill pdf form online free', 'fillable pdf', 'fill out pdf without acrobat', 'fill pdf form without uploading', 'flatten pdf form', 'pdf form filler'],
  metaTitle: 'Fill PDF Forms Online Free | No Upload',
  metaDescription: 'Fill PDF forms in your browser, free: every fillable field gets a real box or tick box, then save with fields editable or locked so answers cannot change.',
}

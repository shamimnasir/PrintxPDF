import type { ToolContent } from './types'

export const pdfForms: ToolContent = {
  slug: 'pdf-forms',
  answer:
    'Fill PDF Forms reads the AcroForm fields inside a PDF, shows a matching control for each one (text boxes, checkboxes, radio buttons, dropdowns, option lists), and saves your answers back into the file. Save filled keeps the fields editable; Save flattened locks them. Free, in your browser, nothing uploaded.',
  whatHeading: 'What is a PDF form?',
  what: [
    {
      term: 'What is a PDF form (AcroForm)?',
      definition:
        'An AcroForm is the interactive form system defined in ISO 32000. Each field is an object with a name, a type and a value, tied to a widget drawn on a page. The types are **text**, **checkbox**, **radio group**, **choice** (a dropdown or a scrolling option list), **button** and **signature**. A typed value is stored in the field and drawn as an appearance so readers show it. This tool reads every field, gives you a real control for each, and writes the values back.',
    },
    {
      term: 'What is an XFA form?',
      definition:
        'Some forms, notably older government and banking forms, are built with XFA, an XML-based system that only a few readers can display. XFA fields are not AcroForm fields, so this tool cannot read them; such a file shows as having no fillable fields. Forms that offer a flat, print-ready version usually provide one as an AcroForm PDF, which this tool handles.',
    },
    {
      term: 'What does flattening a form do?',
      definition:
        'Flattening paints each answer into the page content and removes the field objects, so what you see is fixed ink rather than an editable box. The result cannot be changed in a reader and cannot be accidentally cleared, which is what most recipients want. It is one-way, so keep the filled version if you may need to edit later.',
    },
  ],
  whyHeading: 'Why fill PDF forms in the browser?',
  why: [
    { h: 'No printing, no scanning', x: 'Type the answers, tick the boxes and download a file that reads cleanly, instead of a photographed printout.' },
    { h: 'Sensitive answers stay on your machine', x: 'Tax, medical and employment forms carry identity numbers and addresses. The fields are read and written inside the tab and nothing is uploaded.' },
    { h: 'Lock the answers before sending', x: 'Save flattened turns the answers into fixed page content, so nobody can quietly change a figure after you sign off.' },
    { h: 'Keep an editable version', x: 'Save filled leaves the fields live, so a recurring form can be reopened next month and updated rather than retyped.' },
    { h: 'Free, no account, no watermark', x: 'There is no page limit and nothing to install. Any current browser on desktop or phone works.' },
  ],
  howHeading: 'How to fill a PDF form, step by step',
  how: [
    { h: 'Open Fill PDF Forms and drop the form.', x: 'Drag the PDF onto the drop zone. A Reading fields badge shows while the AcroForm is parsed. A password-protected file shows a notice pointing you to [Unlock PDF](/tools/unlock-pdf); a file with no fields points you to [Edit PDF](/tools/edit-pdf), which stamps text anywhere.' },
    { h: 'Fill in each field.', x: 'Every field is listed by its name with a badge for its type: Text (single line or multi-line), Checkbox, Radio group with a Clear button, Dropdown or Option list. Fields marked read-only, and buttons, are shown but left as they are.' },
    { h: 'Check the count in the Save panel.', x: 'The panel on the right reports how many fields are editable and how many already have a value, so a missed box is easy to spot before saving.' },
    { h: 'Click Save filled or Save flattened.', x: '**Save filled** writes the answers and downloads `name-filled.pdf` with the fields still live. **Save flattened** paints the answers into the pages, removes the form and downloads `name-flattened.pdf`. Flatten last, on a copy.' },
  ],
  faqs: [
    {
      q: 'Why does it say my PDF has no fillable form fields?',
      a: 'Because the boxes and lines you can see are drawn graphics, not AcroForm fields. That is the case for scanned forms, forms exported as flat PDFs and XFA forms. You can still type on such a file with [Edit PDF](/tools/edit-pdf), which places text wherever you click, and download the result.',
    },
    {
      q: 'Will the filled text look the same in every reader?',
      a: 'Nearly. Field appearances are regenerated with Helvetica, so a form that specifies another font can look slightly different in the box. The values themselves are stored correctly, and readers that redraw fields with their own font will show them their way. Flattening fixes the Helvetica appearance into the page for good.',
    },
    {
      q: 'What is the difference between Save filled and Save flattened?',
      a: 'Save filled keeps the form interactive: your answers are stored in the fields and anyone with a reader can change them later. Save flattened paints the answers into the page and deletes the fields, so the document is fixed. Use filled while you are still working and flattened for the copy you send.',
    },
    {
      q: 'Can I fill a password-protected form?',
      a: 'Not until the password is removed. The tool deliberately refuses to read fields from an encrypted file, because writing values into it would produce a broken document. Run it through [Unlock PDF](/tools/unlock-pdf) first, using the password you have, then fill it here.',
    },
    {
      q: 'Can I choose several items in an option list?',
      a: 'No. Option lists that allow multiple selections are saved with one choice only, the one you pick in the dropdown. Dropdowns, radio groups and checkboxes behave exactly as designed. Digital signature fields are shown but cannot be signed here; to add a visible signature image, use [Sign PDF](/tools/sign-pdf).',
    },
  ],
  entities: ['AcroForm', 'ISO 32000', 'XFA', 'PDF', 'Helvetica', 'pdf-lib', 'Adobe Acrobat', 'macOS Preview'],
  keywords: ['fill pdf form', 'fill pdf form online free', 'fillable pdf', 'fill out pdf without acrobat', 'fill pdf form without uploading', 'flatten pdf form', 'pdf form filler'],
  metaTitle: 'Fill PDF Forms Online Free | No Upload',
  metaDescription: 'Fill PDF forms in your browser, free: every AcroForm field gets a real control, then save with fields live or flattened so answers cannot change. No upload.',
}

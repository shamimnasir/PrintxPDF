import type { ToolContent } from './types'

export const deletePages: ToolContent = {
  slug: 'delete-pages',
  answer:
    'Delete Pages removes the pages you list, such as 2, 5-7, from a PDF and gives you a new file with the rest in their original order. Pages are copied without re-rendering, so quality is unchanged. It runs free in your browser: no upload, no sign-up, no watermark.',
  whatHeading: 'What does deleting PDF pages do?',
  what: [
    {
      term: 'How pages are removed',
      definition:
        'The tool builds a new PDF and copies into it every page you did not list, in the order they had. The removed pages, with the images that belonged only to them, are **not carried across at all**, so the file usually shrinks. Resources shared with surviving pages, such as an embedded font, stay because those pages still need them. Your original file is not modified.',
    },
    {
      term: 'Physical page numbers versus printed numbers',
      definition:
        'The numbers you type are physical positions counting from the first sheet as 1, not the folio printed on the page. A report with an unnumbered cover and a contents page has its printed page 1 in third position, so deleting it means typing `3`. Check the position in [PDF Reader](/tools/pdf-reader) or use [Organize Pages](/tools/organize-pdf) to delete by thumbnail instead.',
    },
  ],
  whyHeading: 'Why delete PDF pages in the browser?',
  why: [
    { h: 'Drop blank pages from a scan', x: 'Duplex scanners add an empty back for every single-sided sheet. Listing them once removes them all and the file gets smaller.' },
    { h: 'Remove what should not be shared', x: 'Take out the internal cover note or the pricing appendix before a PDF goes to a client, without exporting the whole document again.' },
    { h: 'Nothing is re-encoded', x: 'The surviving pages are copied with their fonts and images intact. Text stays searchable and scans keep their resolution.' },
    { h: 'Private and free', x: 'The file is read and rebuilt inside the tab. No upload, no account and no copy on a server that has to be deleted later.' },
  ],
  howHeading: 'How to delete pages from a PDF, step by step',
  how: [
    { h: 'Open Delete Pages and drop your PDF.', x: 'Drag one file onto the drop zone or click to browse. The Pages to delete field appears on the right.' },
    { h: 'Type the pages to delete.', x: 'Enter single pages and ranges separated by commas, for example `2, 5-7`. `10-` means page ten to the end. Numbers count from the first physical page.' },
    { h: 'Click Run Delete Pages.', x: 'The kept pages are copied into a new document in your browser. You cannot delete every page; if the list covers the whole file you get a message instead of an empty PDF.' },
    { h: 'Download the trimmed file.', x: 'The result downloads as `name-trimmed.pdf` and the Ready list notes how many pages were removed and how many remain. Prefer to see the pages first? [Organize Pages](/tools/organize-pdf) deletes by thumbnail.' },
  ],
  faqs: [
    {
      q: 'Can I delete pages from a PDF without installing software?',
      a: 'Yes. This runs entirely in the browser using a PDF library loaded with the page, so there is nothing to install and the file is never uploaded. It works in current versions of Chrome, Firefox, Safari and Edge on desktop and on phones.',
    },
    {
      q: 'Will deleting pages make the file smaller?',
      a: 'Usually. Images and drawings that belonged only to the removed pages are not copied, so a scan loses a proportional amount of size. Fonts shared with the remaining pages stay. If the result is still large, run it through [Compress PDF](/tools/compress-pdf).',
    },
    {
      q: 'Is the deleted content really gone from the file?',
      a: 'Yes. The new PDF is assembled only from the pages you kept, so the removed pages and their private resources are not present in any form. This is different from hiding a paragraph on a page you keep; for that, [Redact PDF](/tools/redact-pdf) removes the words themselves.',
    },
    {
      q: 'What if I delete the wrong page?',
      a: 'Nothing is lost. The tool writes a new file and leaves your original untouched, so drop the original again with a corrected list. If you are unsure of the numbers, [Organize Pages](/tools/organize-pdf) shows a thumbnail of each page with a delete button under it.',
    },
    {
      q: 'Can I delete pages from a password-protected PDF?',
      a: 'Only after removing the password. An encrypted file can be opened for structure, but its page content stays encrypted and the copied pages may come out blank. Use [Unlock PDF](/tools/unlock-pdf) first, then delete the pages you do not need.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'pdf-lib', 'Adobe Acrobat', 'macOS Preview', 'Google Chrome'],
  keywords: ['delete pages from pdf', 'remove pages from pdf online free', 'delete pdf pages without uploading', 'remove blank pages from pdf', 'delete a page from a pdf', 'pdf page remover'],
  metaTitle: 'Delete Pages from PDF Online Free | No Upload',
  metaDescription: 'Delete pages from a PDF by number or range, free and in your browser. The rest keep their order and quality, and the file never leaves your computer.',
}

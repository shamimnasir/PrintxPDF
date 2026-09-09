import type { ToolContent } from './types'

export const mergePdf: ToolContent = {
  slug: 'merge-pdf',
  answer:
    'Merge PDF combines two or more PDF files into one document, in the order you set, entirely in your browser. Pages are copied as they are, so text, images and vector graphics keep their original quality. Nothing is uploaded, no account is needed and it is free.',
  whatHeading: 'What does merging PDFs do?',
  what: [
    {
      term: 'What happens when PDFs are merged',
      definition:
        'A merge walks the page tree of each source file and appends every page, in sequence, to a new PDF. The page objects, with their fonts, images and content streams, are **copied across rather than re-rendered**, which is why a merged file looks identical to its parts. A merge does not deduplicate: a font embedded in three source files is carried three times, so the result can be a little larger than the pages alone would suggest.',
    },
    {
      term: 'What is carried over and what is not',
      definition:
        'Anything that belongs to a page travels with it: text, images, vector drawings and the page size. Anything that belongs to the document does not. Bookmarks (the outline panel), document metadata such as title and author, and the interactive form definition stay behind, so a merged file has no bookmarks and any form fields lose their live behaviour. Flatten forms first with [Flatten PDF](/tools/flatten-pdf) if the answers must stay visible.',
    },
  ],
  whyHeading: 'Why merge PDFs in the browser?',
  why: [
    { h: 'One attachment instead of five', x: 'A single file is opened once and read in order. Recipients stop hunting through a thread of separate PDFs, and portals that accept one upload get exactly one.' },
    { h: 'The order you choose', x: 'Move files up or down in the list before you run, so the cover letter comes first and the appendix last without any second pass.' },
    { h: 'No quality loss', x: 'Pages are copied by reference, not printed to images. Vector text stays sharp and searchable and photographs keep their original resolution.' },
    { h: 'Private by design', x: 'Contracts, medical records and payroll never leave the tab. The merge runs on your own machine, so there is nothing to delete from a server afterwards.' },
    { h: 'Free, no sign-up, no watermark', x: 'There is no page cap and no account. The only limit is the memory of your browser tab, which comfortably handles hundreds of pages.' },
  ],
  howHeading: 'How to merge PDF files, step by step',
  how: [
    { h: 'Open Merge PDF and drop your files.', x: 'Drag two or more PDFs onto the drop zone, or click it to browse. You can add more at any time; each one joins the list below.' },
    { h: 'Put them in order.', x: 'Use the arrows in the file list to move a file up or down. The merged document follows this list from top to bottom. Remove anything added by mistake with the delete control.' },
    { h: 'Click Run Merge PDF.', x: 'The pages are copied in your browser and the progress bar names each file as it is merged. Nothing is sent anywhere.' },
    { h: 'Download merged.pdf.', x: 'The result downloads automatically and appears in the Ready list, where you can download it again or open it in a new tab. To reorder single pages afterwards, use [Organize Pages](/tools/organize-pdf); to shrink the result, use [Compress PDF](/tools/compress-pdf).' },
  ],
  faqs: [
    {
      q: 'Does merging PDFs reduce quality?',
      a: 'No. Merge PDF copies each page object into the new file, including its fonts and images, without re-rendering anything. Text remains vector and selectable, and images keep the resolution and compression they already had. The only change you might notice is a slightly larger file, because shared fonts are not deduplicated.',
    },
    {
      q: 'Can I merge password-protected PDFs?',
      a: 'Not reliably. An encrypted file can be opened for structure but its page content stays encrypted, so the merged result may show blank pages. Remove the password first with [Unlock PDF](/tools/unlock-pdf), then merge. If you need the final file protected again, run it through [Protect PDF](/tools/protect-pdf) afterwards.',
    },
    {
      q: 'Is there a limit on how many files or pages I can merge?',
      a: 'There is no fixed cap. The work happens in your browser, so the practical limit is the memory of the tab. Hundreds of pages of ordinary documents merge quickly on a laptop. Very large scanned files, several hundred megabytes together, may be slow on a phone.',
    },
    {
      q: 'Do bookmarks and form fields survive a merge?',
      a: 'Bookmarks belong to the document rather than to a page, so they are not carried into the merged file. Form fields keep their appearance but lose the field definition, which means readers may not let you edit them. If the answers matter, flatten each form first with [Flatten PDF](/tools/flatten-pdf).',
    },
    {
      q: 'Can I change the page order after merging?',
      a: 'Yes. Open the merged file in [Organize Pages](/tools/organize-pdf), which shows a thumbnail of every page. Drag pages into a new order, rotate any that are sideways, delete what you do not need, and download the rebuilt document. The merge itself only orders whole files.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'pdf-lib', 'PDF page tree', 'Adobe Acrobat', 'macOS Preview', 'Google Chrome'],
  keywords: ['merge pdf', 'combine pdf files', 'merge pdf online free', 'combine multiple pdfs into one', 'merge pdf without uploading', 'join pdf files', 'merge pdf in browser'],
  metaTitle: 'Merge PDF Files Online Free | No Upload',
  metaDescription: 'Merge PDF files into one document in your browser, free. Set the order, keep full quality, and nothing is uploaded: your files never leave the tab.',
}

import type { ToolContent } from './types'

export const mergePdf: ToolContent = {
  slug: 'merge-pdf',
  answer:
    'Merge PDF joins two or more PDF files into one document, in the order you set, entirely in your browser. Pages are copied exactly as they are, so text and pictures keep their original quality. Nothing is uploaded, no account is needed and it is free.',
  whatHeading: 'What does merging PDFs do?',
  what: [
    {
      term: 'What happens when PDFs are merged',
      definition:
        'A merge takes every page of the first file, then every page of the second, and so on, and puts them into one new PDF. The pages are **copied whole, with their fonts and pictures**, rather than redrawn, which is why the merged file looks exactly like its parts. A merge does not remove duplicates: a font that is stored in three source files is carried three times, so the result can be a little larger than you might expect.',
    },
    {
      term: 'What is carried over and what is not',
      definition:
        'Anything that belongs to a page travels with it: text, pictures, drawings and the page size. Anything that belongs to the whole document does not. Bookmarks (the clickable outline in the side panel), the hidden details saved inside the file such as title and author, and the fillable form set-up stay behind. So a merged file has no bookmarks, and fillable fields stop working. If the answers in a form must stay visible, run it through [Flatten PDF](/tools/flatten-pdf) first.',
    },
  ],
  whyHeading: 'Why merge PDFs in the browser?',
  why: [
    { h: 'One attachment instead of five', x: 'A single file is opened once and read in order. Recipients stop hunting through a thread of separate PDFs, and portals that accept one upload get exactly one.' },
    { h: 'The order you choose', x: 'Move files up or down in the list before you run, so the cover letter comes first and the appendix last without any second pass.' },
    { h: 'No quality loss', x: 'Pages are copied, not printed to pictures. Text stays sharp and searchable, and photographs keep their original sharpness.' },
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
      a: 'No. Merge PDF copies each page into the new file, including its fonts and pictures, without redrawing anything. Text stays sharp and selectable, and pictures keep the sharpness they already had. The only change you might notice is a slightly larger file, because a font shared by several files is stored more than once.',
    },
    {
      q: 'Can I merge password-protected PDFs?',
      a: 'Not reliably. A password-protected file can be opened for its structure but the page content stays scrambled, so the merged result may show blank pages. Remove the password first with [Unlock PDF](/tools/unlock-pdf), then merge. If you need the final file protected again, run it through [Protect PDF](/tools/protect-pdf) afterwards.',
    },
    {
      q: 'Is there a limit on how many files or pages I can merge?',
      a: 'There is no fixed cap. The work happens in your browser, so the practical limit is the memory of the tab. Hundreds of pages of ordinary documents merge quickly on a laptop. Very large scanned files, several hundred megabytes together, may be slow on a phone.',
    },
    {
      q: 'Do bookmarks and form fields survive a merge?',
      a: 'Bookmarks belong to the document rather than to a page, so they are not carried into the merged file. Fillable fields keep their look but lose the working part, which means readers may not let you type in them. If the answers matter, flatten each form first with [Flatten PDF](/tools/flatten-pdf).',
    },
    {
      q: 'Can I change the page order after merging?',
      a: 'Yes. Open the merged file in [Organize Pages](/tools/organize-pdf), which shows a small preview of every page. Drag pages into a new order, rotate any that are sideways, delete what you do not need, and download the rebuilt document. The merge itself only orders whole files.',
    },
  ],
  entities: ['PDF', 'PDF pages', 'Bookmarks', 'Adobe Acrobat', 'macOS Preview', 'Google Chrome'],
  keywords: ['merge pdf', 'combine pdf files', 'merge pdf online free', 'combine multiple pdfs into one', 'merge pdf without uploading', 'join pdf files', 'merge pdf in browser'],
  metaTitle: 'Merge PDF Files Online Free | No Upload',
  metaDescription: 'Merge PDF files into one document in your browser, free. Set the order, keep full quality, and nothing is uploaded: your files never leave the tab.',
}

import type { ToolContent } from './types'

export const pageNumbers: ToolContent = {
  slug: 'page-numbers',
  answer:
    'Page Numbers stamps a number on every page of a PDF. Choose a corner or centre position, a format such as 1, 1 / 12 or Page 1, the font size, the starting number, and how many pages to leave unnumbered. It runs in your browser, free, with no upload.',
  whatHeading: 'What are PDF page numbers?',
  what: [
    {
      term: 'What are page numbers in a PDF?',
      definition:
        'Page numbers are text printed on each page so a reader can cite a place, collate a printout and check nothing is missing. This tool draws them into the page content in Helvetica, at the position and size you set, so they print and display in every viewer. They are not a header or footer object that later editing can shift; they are part of the page.',
    },
    {
      term: 'What is a page label?',
      definition:
        'PDF also supports **page labels**: the logical numbering a viewer shows in its page box, such as i, ii, iii for a preface and then 1, 2, 3 for the body. Labels are stored in the file\'s catalogue and never appear on the printed page. This tool does not change labels; it prints visible numbers, which is what most people mean when they ask for page numbers.',
    },
  ],
  whyHeading: 'Why add page numbers to a PDF?',
  why: [
    { h: 'Cite and refer with confidence', x: '"See page 14" only works when page 14 is marked. Numbers make a report, a thesis or a bundle usable in a meeting.' },
    { h: 'Collate a printout', x: 'Drop a stack of loose pages and numbers put it back in order. With the 1 / 12 format, a missing sheet is obvious.' },
    { h: 'Finish a merged document', x: 'Files combined with [Merge PDF](/tools/merge-pdf) arrive with each part\'s own numbering, or none. One pass here gives the whole document a single sequence.' },
    { h: 'Meet submission rules', x: 'Courts, journals, tender portals and universities routinely require numbered pages, often with the cover excluded. The skip option handles that.' },
    { h: 'No upload, no account', x: 'Numbering happens in your browser, so a confidential bundle never leaves your machine.' },
  ],
  howHeading: 'How to add page numbers to a PDF, step by step',
  how: [
    { h: 'Open Page Numbers and drop your PDF', x: 'Drop one file. The options appear on the right.' },
    { h: 'Choose the position', x: 'Bottom center, Bottom right, Bottom left, Top right or Top center. Numbers sit about half an inch in from the edge.' },
    { h: 'Choose the format and size', x: 'Format: `1, 2, 3`, `1 / 12` (number of total) or `Page 1`. Font size runs from 6 to 36 points; 11 is the default.' },
    { h: 'Set the start and skipped pages', x: 'Start at any number. Set Leave first N pages unnumbered to 1 to keep a cover clean; numbering then begins on page 2 with the start number.' },
    { h: 'Click Run Page Numbers', x: 'The numbered file downloads as `name-numbered.pdf`.' },
  ],
  faqs: [
    {
      q: 'How do I skip the cover page?',
      a: 'Set Leave first N pages unnumbered to 1. The cover stays blank and page 2 receives the first number, which is whatever you put in Start at. Use 2 to skip a cover and a contents page.',
    },
    {
      q: 'Does the 1 / 12 format count the skipped pages?',
      a: 'No. The total counts only the pages that are numbered, adjusted for your start value, so a 13-page file with the cover skipped shows 1 / 12 on its first numbered page and 12 / 12 on the last.',
    },
    {
      q: 'Can I use Roman numerals or a different font?',
      a: 'Not in this tool. Numbers are drawn in Helvetica in one of three Arabic formats. If a preface needs i, ii, iii, split the file with [Split PDF](/tools/split-pdf), number each part, and merge them again.',
    },
    {
      q: 'Will the numbers overlap an existing footer?',
      a: 'They can, if the original already has text in the corner you choose. Pick a different position or a smaller size and check the first page of the result. The original file is untouched, so you can run it again.',
    },
    {
      q: 'Does it change the page labels in the viewer?',
      a: 'No. The page box in your PDF viewer keeps showing the file\'s own labels. This tool adds printed numbers to the page content and leaves the catalogue alone.',
    },
  ],
  entities: ['Page numbering', 'Page labels', 'Helvetica', 'PDF content stream', 'Footer', 'Cover page'],
  keywords: ['add page numbers to pdf', 'page numbers pdf free', 'number pdf pages online', 'pdf page numbers skip cover page', 'add page numbers to pdf without acrobat', 'insert page numbers in pdf'],
  metaTitle: 'Add Page Numbers to PDF Free, Skip the Cover Page',
  metaDescription: 'Add page numbers to a PDF free: pick the position, the format (1, 1 / 12 or Page 1), the start number and skip the cover, all in your browser with no upload.',
}

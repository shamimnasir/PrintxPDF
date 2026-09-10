import type { ToolContent } from './types'

export const pageNumbers: ToolContent = {
  slug: 'page-numbers',
  answer:
    'Page Numbers prints a number on every page of your PDF. Choose where it sits, a style such as 1, 1 / 12 or Page 1, the text size, the first number, and how many pages to leave blank. Free, in your browser, never uploaded.',
  whatHeading: 'What are PDF page numbers?',
  what: [
    {
      term: 'What are page numbers in a PDF?',
      definition:
        'Page numbers are small pieces of text printed on each page. They let a reader say "see page 14", put a printout back in order and spot a missing sheet. This tool prints them onto the page itself, in a plain standard font, at the spot and size you pick. Because they become part of the page, they show up and print in every PDF app.',
    },
    {
      term: 'What is a page label?',
      definition:
        'Some PDFs also carry a hidden numbering that a PDF app shows in its page box, such as i, ii, iii for an introduction and then 1, 2, 3 for the main part. These are called page labels. They never appear on the printed page. This tool does not touch them. It prints visible numbers, which is what most people mean when they ask for page numbers.',
    },
  ],
  whyHeading: 'Why add page numbers to a PDF?',
  why: [
    { h: 'Point to a page with confidence', x: '"See page 14" only works when page 14 says 14 on it. Numbers make a report, a thesis or a bundle easy to use in a meeting.' },
    { h: 'Put a printout back in order', x: 'Drop a stack of loose pages and the numbers tell you the order. With the 1 / 12 style, a missing sheet is obvious.' },
    { h: 'Finish a combined document', x: 'Files joined with [Merge PDF](/tools/merge-pdf) arrive with each part\'s own numbering, or none at all. One pass here gives the whole document one clean sequence.' },
    { h: 'Meet submission rules', x: 'Courts, journals, tender sites and universities often require numbered pages, usually with the cover left blank. The skip option handles that.' },
    { h: 'No upload, no account', x: 'The numbers are added in your browser, so a private document never leaves your computer.' },
  ],
  howHeading: 'How to add page numbers to a PDF, step by step',
  how: [
    { h: 'Open Page Numbers and drop your PDF', x: 'Drop one file. The options appear on the right.' },
    { h: 'Choose the position', x: 'Bottom center, Bottom right, Bottom left, Top right or Top center. Numbers sit about half an inch in from the edge.' },
    { h: 'Choose the style and size', x: 'Style: `1, 2, 3`, `1 / 12` (this page out of the total) or `Page 1`. Text size runs from 6 to 36 points; 11 is the default.' },
    { h: 'Set the first number and skipped pages', x: 'Start at any number. Set Leave first N pages unnumbered to 1 to keep a cover clean; numbering then begins on page 2 with your start number.' },
    { h: 'Click Run Page Numbers', x: 'The numbered file downloads as `name-numbered.pdf`.' },
  ],
  faqs: [
    {
      q: 'How do I skip the cover page?',
      a: 'Set Leave first N pages unnumbered to 1. The cover stays blank and page 2 gets the first number, which is whatever you typed in Start at. Use 2 to skip both a cover and a contents page.',
    },
    {
      q: 'Does the 1 / 12 style count the skipped pages?',
      a: 'No. The total counts only the pages that get a number, adjusted for your start value. So a 13-page file with the cover skipped shows 1 / 12 on its first numbered page and 12 / 12 on the last.',
    },
    {
      q: 'Can I use Roman numerals or a different font?',
      a: 'Not in this tool. Numbers use one plain standard font and one of three ordinary number styles. If an introduction needs i, ii, iii, split the file with [Split PDF](/tools/split-pdf), number each part, then join them again.',
    },
    {
      q: 'Will the numbers sit on top of an existing footer?',
      a: 'They can, if the original already has text in the corner you choose. Pick a different position or a smaller size and check the first page of the result. Your original file is untouched, so you can run it again.',
    },
    {
      q: 'Does it change the page numbers shown in my PDF app?',
      a: 'No. The page box in your PDF app keeps showing the file\'s own hidden labels. This tool prints visible numbers onto the pages and leaves everything else alone.',
    },
  ],
  entities: ['Page numbering', 'Page labels', 'Footer', 'Cover page', 'PDF'],
  keywords: ['add page numbers to pdf', 'page numbers pdf free', 'number pdf pages online', 'pdf page numbers skip cover page', 'add page numbers to pdf without acrobat', 'insert page numbers in pdf'],
  metaTitle: 'Add Page Numbers to PDF Free, Skip the Cover Page',
  metaDescription: 'Add page numbers to a PDF free: pick the position, the style (1, 1 / 12 or Page 1), the first number and skip the cover, all in your browser with no upload.',
}

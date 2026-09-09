import type { ToolContent } from './types'

export const extractPages: ToolContent = {
  slug: 'extract-pages',
  answer:
    'Extract Pages pulls the pages you list, such as 1, 3-4, out of a PDF into a new document and leaves the original untouched. Pages are copied with their fonts and images, so nothing is re-rendered. Free, in your browser, with no upload and no account.',
  whatHeading: 'What does extracting PDF pages mean?',
  what: [
    {
      term: 'How extraction works',
      definition:
        'Extracting is the mirror image of deleting: the pages you name are the ones that go into the new file, everything else is left behind. The chosen pages are **copied with their content streams, fonts and images**, so the output is pixel-for-pixel the same as those pages in the source. They come out in the order you type them, so `5, 1` gives page five first and page one second; a page listed twice is included once.',
    },
    {
      term: 'Extract versus split',
      definition:
        'Both take pages out of a PDF, but they answer different needs. Extract Pages produces a single file containing a chosen set, which can be scattered pages such as `2, 9, 14-15`. [Split PDF](/tools/split-pdf) produces several files, one per range or one per page. Use extract when you want one document to send, split when you want a set of separate documents.',
    },
  ],
  whyHeading: 'Why extract PDF pages in the browser?',
  why: [
    { h: 'Send one chapter, not the book', x: 'Pull the pages a colleague needs into a small file that opens on the page that matters, instead of directing them to page 47 of a large attachment.' },
    { h: 'Keep the signed page', x: 'Lift a signature page or an executed schedule out of a long contract for filing, with no re-scan.' },
    { h: 'Hold back what is confidential', x: 'Share the summary and leave the annexes out. The pages you do not list are simply absent from the output.' },
    { h: 'No quality loss', x: 'Pages are copied, not rendered to images. Text stays selectable and searchable, and scans keep their resolution.' },
    { h: 'Private and free', x: 'The original never leaves the tab and there is no account or watermark.' },
  ],
  howHeading: 'How to extract pages from a PDF, step by step',
  how: [
    { h: 'Open Extract Pages and drop your PDF.', x: 'Drag one file onto the drop zone or click to browse. The Pages to keep field appears on the right.' },
    { h: 'Type the pages to keep.', x: 'Enter single pages and ranges separated by commas, for example `1, 3-4`. `7-` means page seven to the end. The output follows the order you type, so `3, 1` puts page three first.' },
    { h: 'Click Run Extract Pages.', x: 'The listed pages are copied into a new document in your browser. If the list matches no page you get a message rather than an empty file.' },
    { h: 'Download the new PDF.', x: 'The result downloads as `name-extract.pdf` and appears in the Ready list. Want to see the pages before choosing? [Organize Pages](/tools/organize-pdf) shows thumbnails and lets you delete the rest.' },
  ],
  faqs: [
    {
      q: 'Can I extract a single page from a PDF?',
      a: 'Yes. Type its number in Pages to keep, for example `6`, and run. The output is a one-page PDF with that page exactly as it appears in the source, including its size, text layer and any images.',
    },
    {
      q: 'Does extracting pages keep the original quality?',
      a: 'Yes. The page objects are copied into the new file with their fonts and images, and nothing is rasterised or recompressed. Extracted pages look identical, and text remains selectable. The one thing not copied is document-level data such as bookmarks and metadata.',
    },
    {
      q: 'Can I reorder the extracted pages?',
      a: 'Yes. Pages come out in the order you list them, so `4, 2, 1` produces a three-page file in that order. For a visual approach, extract first and then drag pages around in [Organize Pages](/tools/organize-pdf).',
    },
    {
      q: 'Do links and bookmarks survive extraction?',
      a: 'Links drawn on an extracted page are copied with it, but a link that jumps to a page you left out has nowhere to go. Bookmarks belong to the document rather than to a page and are not carried across. Page sizes, text and images all come through unchanged.',
    },
    {
      q: 'What is the difference between Extract Pages and Split PDF?',
      a: 'Extract Pages gives you one file containing the pages you choose, in any order. [Split PDF](/tools/split-pdf) gives you several files, one for each range or each page. If you need a single document to send, extract; if you need separate documents, split.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'pdf-lib', 'Adobe Acrobat', 'macOS Preview', 'Google Chrome'],
  keywords: ['extract pages from pdf', 'extract pdf pages online free', 'save one page of a pdf', 'extract pages from pdf without uploading', 'pull pages out of a pdf', 'pdf page extractor'],
  metaTitle: 'Extract Pages from PDF Online Free | No Upload',
  metaDescription: 'Extract pages from a PDF into a new file by number or range, free and in your browser. Original quality is kept and nothing is uploaded anywhere.',
}

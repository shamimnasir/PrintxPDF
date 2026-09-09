import type { ToolContent } from './types'

export const organizePdf: ToolContent = {
  slug: 'organize-pdf',
  answer:
    'Organize Pages shows every page of a PDF as a thumbnail so you can drag pages into a new order, rotate any page, and delete the ones you do not need, then download the rebuilt file. Everything happens in your browser: nothing is uploaded, no sign-up, and it is free.',
  whatHeading: 'What does organizing PDF pages mean?',
  what: [
    {
      term: 'Reordering, rotating and deleting in one pass',
      definition:
        'Organizing a PDF means changing which pages it contains and in what order, without touching what is printed on them. This tool renders a small preview of each page in your browser, lets you arrange those previews, and then **builds a new file by copying the pages** in the order you left them. Text, images and vector drawings come across untouched, so a rearranged file looks exactly like the source, page for page.',
    },
    {
      term: 'How page rotation is stored',
      definition:
        'A PDF page carries a Rotate attribute of 0, 90, 180 or 270 degrees that every viewer and printer applies when it draws the page. Rotating here adds to that attribute rather than re-rendering pixels, which makes the change **lossless and permanent**: it is saved in the file, unlike the temporary rotation in a reader\'s View menu, and it survives printing and conversion.',
    },
  ],
  whyHeading: 'Why organize PDF pages in the browser?',
  why: [
    { h: 'See before you commit', x: 'Thumbnails show every page at once, so an out-of-order scan or a stray blank page is obvious before you download anything.' },
    { h: 'Fix scans in one go', x: 'A duplex scan that came out reversed, a landscape page lying on its side and a blank back page are all handled in the same grid, with one download at the end.' },
    { h: 'No quality loss', x: 'Pages are copied, not re-rendered. Rotation is a page attribute, so even a 300 dpi scan keeps every pixel it had.' },
    { h: 'Private for confidential files', x: 'Thumbnails are rendered on your machine and the rebuilt PDF is written there too. Nothing is uploaded, so nothing needs deleting from a server.' },
    { h: 'Free with no page cap', x: 'There is no account and no limit on pages beyond the memory of your browser tab.' },
  ],
  howHeading: 'How to organize PDF pages, step by step',
  how: [
    { h: 'Open Organize Pages and drop your PDF.', x: 'Drag one file onto the drop zone. Thumbnails render page by page; a badge shows the page count and a Rendering badge disappears when every preview is ready.' },
    { h: 'Drag pages into order.', x: 'Pick up any thumbnail and drop it where it belongs, or use the Move left and Move right arrows under a page. Reverse flips the order of the whole document, which fixes a back-to-front scan in one click.' },
    { h: 'Rotate what is sideways.', x: 'Each thumbnail has Rotate left and Rotate right buttons that turn that page by 90 degrees; the preview turns with it. Rotate all turns every page 90 degrees clockwise at once.' },
    { h: 'Delete pages you do not need.', x: 'Click the × on a thumbnail to drop that page. It vanishes from the grid and will not be in the result. The original file on your disk is never changed.' },
    { h: 'Click Apply & download.', x: 'The pages are copied into a new file in the order shown, with the rotations applied, and it downloads as `name-organized.pdf`. Change file starts again with a different PDF.' },
  ],
  faqs: [
    {
      q: 'Does reordering or rotating pages change the quality?',
      a: 'No. Reordering copies the page objects into a new file with their fonts and images intact, and rotation is stored as a page attribute that viewers apply on the fly. Nothing is rasterised, so text stays selectable and scans keep their resolution.',
    },
    {
      q: 'Can I undo a deletion in the grid?',
      a: 'Not inside the grid itself. The quickest recovery is Change file: drop the same PDF again and the full set of pages comes back, because the original on your disk is untouched. Only Apply & download writes anything, and it writes a new file rather than overwriting the source.',
    },
    {
      q: 'Can I organize pages from two different PDFs together?',
      a: 'Not in one step. Combine the files first with [Merge PDF](/tools/merge-pdf), then open the merged file here to interleave, rotate or delete individual pages. Doing it in that order keeps both operations lossless.',
    },
    {
      q: 'Why do the thumbnails take a moment to appear?',
      a: 'Each page is rendered in your browser at a small size so you can see it. Ordinary text pages appear almost instantly; large colour scans take longer because every pixel has to be decoded first. Wait for the Rendering badge to clear before applying, so the grid reflects every page.',
    },
    {
      q: 'Do bookmarks survive?',
      a: 'No. Bookmarks belong to the document rather than to a page, and the rebuilt file is a fresh document that receives only the pages. Page content, links drawn on a page and page sizes all come across. If bookmarks matter, keep the original and organize a copy.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'pdf-lib', 'PDF.js', 'PDF Rotate attribute', 'Adobe Acrobat', 'macOS Preview'],
  keywords: ['organize pdf pages', 'reorder pdf pages', 'rearrange pdf pages online free', 'rotate and delete pdf pages', 'change pdf page order', 'reorder pdf pages without uploading', 'pdf page organizer'],
  metaTitle: 'Organize PDF Pages Online Free | Reorder, Rotate',
  metaDescription: 'Organize PDF pages in your browser, free: drag thumbnails to reorder, rotate or delete any page, then download the rebuilt file. Nothing is uploaded.',
}

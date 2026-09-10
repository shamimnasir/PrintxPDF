import type { ToolContent } from './types'

export const organizePdf: ToolContent = {
  slug: 'organize-pdf',
  answer:
    'Organize Pages shows every page of a PDF as a preview so you can drag pages into a new order, rotate any page, and delete the ones you do not need, then download the rebuilt file. Everything happens in your browser: nothing is uploaded, no sign-up, and it is free.',
  whatHeading: 'What does organizing PDF pages mean?',
  what: [
    {
      term: 'Reordering, rotating and deleting in one pass',
      definition:
        'Organizing a PDF means changing which pages it contains and in what order, without touching what is printed on them. This tool draws a small preview of each page in your browser, lets you arrange those previews, and then **builds a new file by copying the pages** in the order you left them. Text, pictures and drawings come across untouched, so a rearranged file looks exactly like the source, page for page.',
    },
    {
      term: 'How page rotation is stored',
      definition:
        'Every PDF page carries a small note saying which way up it should be shown: 0, 90, 180 or 270 degrees. Every viewer and printer obeys it. Rotating here changes that note rather than redrawing the page, so **nothing is lost and the change is permanent**: it is saved in the file, unlike the temporary rotation in a reader\'s View menu, and it survives printing and conversion.',
    },
  ],
  whyHeading: 'Why organize PDF pages in the browser?',
  why: [
    { h: 'See before you commit', x: 'Previews show every page at once, so an out-of-order scan or a stray blank page is obvious before you download anything.' },
    { h: 'Fix scans in one go', x: 'A two-sided scan that came out reversed, a wide page lying on its side and a blank back page are all handled in the same grid, with one download at the end.' },
    { h: 'No quality loss', x: 'Pages are copied, not redrawn. Rotation is a note on the page, so even a sharp scan keeps every dot it had.' },
    { h: 'Private for confidential files', x: 'Previews are drawn on your machine and the rebuilt PDF is written there too. Nothing is uploaded, so nothing needs deleting from a server.' },
    { h: 'Free with no page cap', x: 'There is no account and no limit on pages beyond the memory of your browser tab.' },
  ],
  howHeading: 'How to organize PDF pages, step by step',
  how: [
    { h: 'Open Organize Pages and drop your PDF.', x: 'Drag one file onto the drop zone. Small previews (thumbnails) appear page by page; a badge shows the page count and a Rendering badge disappears when every preview is ready.' },
    { h: 'Drag pages into order.', x: 'Pick up any preview and drop it where it belongs, or use the Move left and Move right arrows under a page. Reverse flips the order of the whole document, which fixes a back-to-front scan in one click.' },
    { h: 'Rotate what is sideways.', x: 'Each preview has Rotate left and Rotate right buttons that turn that page by 90 degrees; the preview turns with it. Rotate all turns every page 90 degrees clockwise at once.' },
    { h: 'Delete pages you do not need.', x: 'Click the × on a preview to drop that page. It vanishes from the grid and will not be in the result. The original file on your disk is never changed.' },
    { h: 'Click Apply & download.', x: 'The pages are copied into a new file in the order shown, with the rotations applied, and it downloads as `name-organized.pdf`. Change file starts again with a different PDF.' },
  ],
  faqs: [
    {
      q: 'Does reordering or rotating pages change the quality?',
      a: 'No. Reordering copies the pages into a new file with their fonts and pictures intact, and rotation is stored as a note on the page that viewers obey as they draw it. Nothing is turned into a picture, so text stays selectable and scans stay sharp.',
    },
    {
      q: 'Can I undo a deletion in the grid?',
      a: 'Not inside the grid itself. The quickest recovery is Change file: drop the same PDF again and the full set of pages comes back, because the original on your disk is untouched. Only Apply & download writes anything, and it writes a new file rather than overwriting the source.',
    },
    {
      q: 'Can I organize pages from two different PDFs together?',
      a: 'Not in one step. Combine the files first with [Merge PDF](/tools/merge-pdf), then open the merged file here to mix, rotate or delete individual pages. Doing it in that order keeps both steps free of quality loss.',
    },
    {
      q: 'Why do the previews take a moment to appear?',
      a: 'Each page is drawn in your browser at a small size so you can see it. Ordinary text pages appear almost instantly; large colour scans take longer because every dot has to be unpacked first. Wait for the Rendering badge to clear before applying, so the grid shows every page.',
    },
    {
      q: 'Do bookmarks survive?',
      a: 'No. Bookmarks belong to the whole document rather than to a page, and the rebuilt file is a fresh document that receives only the pages. Page content, links drawn on a page and page sizes all come across. If bookmarks matter, keep the original and organize a copy.',
    },
  ],
  entities: ['PDF', 'PDF pages', 'Page rotation', 'Page thumbnails', 'Adobe Acrobat', 'macOS Preview'],
  keywords: ['organize pdf pages', 'reorder pdf pages', 'rearrange pdf pages online free', 'rotate and delete pdf pages', 'change pdf page order', 'reorder pdf pages without uploading', 'pdf page organizer'],
  metaTitle: 'Organize PDF Pages Online Free | Reorder, Rotate',
  metaDescription: 'Organize PDF pages in your browser, free: drag previews to reorder, rotate or delete any page, then download the rebuilt file. Nothing is uploaded.',
}

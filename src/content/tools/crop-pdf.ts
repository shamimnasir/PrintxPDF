import type { ToolContent } from './types'

export const cropPdf: ToolContent = {
  slug: 'crop-pdf',
  answer:
    'Crop PDF trims the white edges off every page, or only the pages you choose, in your browser. Auto-detect finds the printed content for you, Margins cuts a set amount off each side, and Region keeps one rectangle. Nothing is deleted, so you can undo the crop later.',
  whatHeading: 'What is cropping a PDF?',
  what: [
    {
      term: 'What a crop changes',
      definition:
        'Cropping shrinks the area of a page that PDF apps show and printers print. This tool does it by changing the page\'s visible frame, the rectangle a reader treats as the page. Auto-detect draws the page in your browser, finds the edges of everything that is not white, adds a little breathing room and crops to that. Blank pages are left alone. Margins and Region use the numbers you type instead.',
    },
    {
      term: 'The visible frame versus the full page',
      definition:
        'Every PDF page has a full physical size, and may have a smaller visible frame inside it, which is what gets displayed. Changing the frame **hides the outer area without removing it**. The content is still in the file, so the size does not shrink, and any app that resets the frame shows the full page again. Crops stack, because each one is measured from the frame the page already has. To remove content for good, use [Redact PDF](/tools/redact-pdf).',
    },
  ],
  whyHeading: 'Why crop a PDF in the browser?',
  why: [
    { h: 'Bigger text on small screens', x: 'A paper with wide margins is unreadable on a phone. Trimming the white space lets you zoom the text to the full width.' },
    { h: 'Print without wasted paper', x: 'Crop a two-up scan or a slide with a huge border and the printer fills the sheet with what matters.' },
    { h: 'Isolate one figure or table', x: 'Region mode keeps a single rectangle from a page, ready to drop into a report or a slide.' },
    { h: 'You can undo it', x: 'Because only the visible frame changes, the original page is still inside the file and can be brought back.' },
    { h: 'Private and free', x: 'Pages are measured and rewritten in the tab. There is no upload, no sign-up and no watermark.' },
  ],
  howHeading: 'How to crop a PDF, step by step',
  how: [
    { h: 'Open Crop PDF and drop your file.', x: 'Drag one PDF onto the drop zone or click to browse. The options appear on the right.' },
    { h: 'Choose Crop by.', x: '**Auto-detect content** trims the white space around whatever is printed on each page. **Margins** cuts the amount you type off each side. **Region** keeps the rectangle between the four edges you give.' },
    { h: 'Set the unit and the four edges.', x: 'These fields appear for Margins and Region. Pick Millimetres, Points (a printer\'s unit, 72 to an inch) or Percent of the page under Unit, then fill Top, Right, Bottom and Left. In Region mode all four are measured from the top-left corner of the page, so Right must be larger than Left and Bottom larger than Top.' },
    { h: 'Limit to certain pages, if you want.', x: 'Leave Pages blank to crop every page, or type a list such as `1, 3-5`. Useful when only the pictures at the back have wide borders.' },
    { h: 'Click Run Crop PDF and download.', x: 'The result downloads as `name-cropped.pdf`. The note says how many pages were cropped and how many blank pages were left alone, and reminds you that the crop can be undone.' },
  ],
  faqs: [
    {
      q: 'Is cropping a PDF permanent?',
      a: 'No. The tool changes the visible frame, which tells PDF apps which part of the page to show, and leaves the rest of the page in the file. Any PDF editor that can reset or enlarge that frame brings the full page back. If you want the trimmed area removed for good, use [Redact PDF](/tools/redact-pdf) on it.',
    },
    {
      q: 'Does cropping reduce the file size?',
      a: 'No. The content outside the frame is hidden, not deleted, so the file stays the same size, give or take a few bytes. To make a PDF smaller, use [Compress PDF](/tools/compress-pdf); to remove pages you no longer need, use [Delete Pages](/tools/delete-pages).',
    },
    {
      q: 'Can someone still see what I cropped out?',
      a: 'Yes, if they look. The hidden area is still in the file, and text there can be copied out or revealed by resetting the frame. Cropping is a layout change, not a privacy control. For anything sensitive, [Redact PDF](/tools/redact-pdf) blacks out and permanently removes the words.',
    },
    {
      q: 'Why did Auto-detect leave a page alone?',
      a: 'Because it found nothing to trim. A blank page has no content to crop to, so it is skipped and counted in the note. A page with a background that runs to the edge, or a border drawn right at the edge, counts as content all the way out, so there is no white space to remove. Use Margins on those pages instead.',
    },
    {
      q: 'Does it work on sideways pages?',
      a: 'Yes. The edges you type match the page as you see it on screen, so Top is the top you see even when the page is stored turned by 90 or 270 degrees. The crop is then saved in the page\'s own terms, so every PDF app shows the same result.',
    },
  ],
  entities: ['PDF', 'Crop PDF', 'Page margins', 'Visible page area', 'Kindle reading', 'Adobe Acrobat'],
  keywords: ['crop pdf', 'crop pdf online free', 'remove white margins from pdf', 'crop pdf pages', 'trim pdf margins', 'crop pdf without uploading', 'crop pdf for kindle'],
  metaTitle: 'Crop PDF Online Free | Trim Margins, Undo Any Time',
  metaDescription: 'Crop PDF margins in your browser, free: find the content automatically, cut fixed margins or keep one region. Nothing is deleted, so you can undo it. No upload.',
}

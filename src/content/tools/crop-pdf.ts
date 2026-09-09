import type { ToolContent } from './types'

export const cropPdf: ToolContent = {
  slug: 'crop-pdf',
  answer:
    'Crop PDF trims the margins of every page, or only the pages you choose, in your browser. Auto-detect finds the printed content, Margins cuts a set amount off each side, Region keeps one rectangle. It sets the crop box, so nothing is deleted and the crop is reversible.',
  whatHeading: 'What is cropping a PDF?',
  what: [
    {
      term: 'What a crop changes',
      definition:
        'Cropping reduces the area of a page that viewers show and printers print. In this tool it is done by **setting the crop box** of each page, the rectangle a reader treats as the visible page. Auto-detect renders the page in your browser, finds the bounding box of everything that is not white, adds a small margin of air and crops to that; blank pages are left alone. Margins and Region take the numbers you type instead.',
    },
    {
      term: 'Crop box versus media box',
      definition:
        'Every PDF page has a media box, the full physical page, and may have a crop box inside it, which is what gets displayed. Changing the crop box **hides the outer area without removing it**: the content is still in the file, so the size does not shrink and any tool that resets the crop box shows the full page again. Crops compose, because each one is measured from the crop box the page already has. To remove content for good, use [Redact PDF](/tools/redact-pdf).',
    },
  ],
  whyHeading: 'Why crop a PDF in the browser?',
  why: [
    { h: 'Bigger text on small screens', x: 'A paper with wide margins is unreadable on a small screen. Trimming the white space lets the reader zoom the text to the full width.' },
    { h: 'Print without wasted paper', x: 'Crop a two-up scan or a slide with a huge border and the printer fills the sheet with what matters.' },
    { h: 'Isolate one figure or table', x: 'Region mode keeps a single rectangle from a page, ready to drop into a report or a slide.' },
    { h: 'Reversible by design', x: 'Because only the crop box changes, the original page is still inside the file and can be restored.' },
    { h: 'Private and free', x: 'Pages are measured and rewritten in the tab. There is no upload, no sign-up and no watermark.' },
  ],
  howHeading: 'How to crop a PDF, step by step',
  how: [
    { h: 'Open Crop PDF and drop your file.', x: 'Drag one PDF onto the drop zone or click to browse. The options appear on the right.' },
    { h: 'Choose Crop by.', x: '**Auto-detect content** trims the white space around whatever is printed on each page. **Margins** cuts the amount you type off each side. **Region** keeps the rectangle between the four edges you give.' },
    { h: 'Set the unit and the four edges.', x: 'These fields appear for Margins and Region. Pick Millimetres, Points or Percent of the page under Unit, then fill Top, Right, Bottom and Left. In Region mode all four are measured from the top-left corner of the page, so Right must be larger than Left and Bottom larger than Top.' },
    { h: 'Limit to certain pages, if you want.', x: 'Leave Pages blank to crop every page, or type a list such as `1, 3-5`. Useful when only the plates at the back have wide borders.' },
    { h: 'Click Run Crop PDF and download.', x: 'The result downloads as `name-cropped.pdf`. The note says how many pages were cropped and how many blank pages were left untouched, and reminds you that the crop is reversible.' },
  ],
  faqs: [
    {
      q: 'Is cropping a PDF permanent?',
      a: 'No. The tool sets the crop box, which tells readers which part of the page to show, and leaves the rest of the page in the file. Any PDF editor that can reset or enlarge the crop box brings the full page back. If you want the trimmed area removed for good, use [Redact PDF](/tools/redact-pdf) on it.',
    },
    {
      q: 'Does cropping reduce the file size?',
      a: 'No. The content outside the crop box is hidden, not deleted, so the file stays the same size, give or take a few bytes. To make a PDF smaller, use [Compress PDF](/tools/compress-pdf); to remove pages you no longer need, use [Delete Pages](/tools/delete-pages).',
    },
    {
      q: 'Can someone still see what I cropped out?',
      a: 'Yes, if they look. The hidden area is still in the file, and text there can be extracted or revealed by resetting the crop box. Cropping is a layout change, not a privacy control. For anything sensitive, [Redact PDF](/tools/redact-pdf) rasterises the region so the words are gone.',
    },
    {
      q: 'Why did Auto-detect leave a page alone?',
      a: 'Because it found nothing to trim. A blank page has no content to crop to, so it is skipped and counted in the note. A page with a full-bleed background or a border drawn to the edge counts as content all the way out, so there is no white space to remove; use Margins on those pages instead.',
    },
    {
      q: 'Does it work on rotated pages?',
      a: 'Yes. The edges you type are read in the visual frame, the way the page looks on screen, so Top is the top you see even when the page carries a stored rotation of 90 or 270 degrees. The crop box is then written in the page\'s own coordinates, so every viewer shows the same result.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'PDF crop box', 'PDF media box', 'pdf-lib', 'PDF.js', 'Adobe Acrobat'],
  keywords: ['crop pdf', 'crop pdf online free', 'remove white margins from pdf', 'crop pdf pages', 'trim pdf margins', 'crop pdf without uploading', 'crop pdf for kindle'],
  metaTitle: 'Crop PDF Online Free | Trim Margins, Reversible',
  metaDescription: 'Crop PDF margins in your browser, free: auto-detect the content, cut fixed margins or keep one region. Sets the crop box, so it is reversible. No upload.',
}

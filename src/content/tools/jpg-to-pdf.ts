import type { ToolContent } from './types'

export const jpgToPdf: ToolContent = {
  slug: 'jpg-to-pdf',
  answer:
    'JPG to PDF puts one or more JPG, PNG or WebP pictures into a single PDF, built in your browser. Choose A4, Letter or a page the same size as each picture, decide how it fits, set a margin, and download one clean file. Nothing is uploaded.',
  whatHeading: 'What are JPG, PNG, WebP and PDF?',
  what: [
    {
      term: 'JPG: the photo format from cameras and phones',
      definition:
        'JPG is the format cameras and phones save photos in. It keeps files small by dropping tiny details your eye does not notice. A PDF can hold a JPG exactly as it is, so this tool places your photo inside the PDF untouched: no second round of squeezing, and no loss of quality beyond what the camera already applied when it took the picture.',
    },
    {
      term: 'PNG and WebP: screenshots and web pictures',
      definition:
        'PNG stores every pixel exactly, which makes it ideal for screenshots and graphics with flat colour and sharp text. WebP is a newer web format from Google that can be either small or exact. A PDF holds PNG directly. WebP, GIF and BMP pictures are read in your browser and saved again as an exact PNG before they go in, so no detail is lost in the step.',
    },
    {
      term: 'PDF: one file, many pages',
      definition:
        'A PDF is a page format with a fixed layout. Every viewer, phone and printer draws a PDF page the same way, which is why it is the usual choice for receipts, forms, scans and portfolios. A PDF can hold many pages in one file, so a folder of photos becomes a single attachment that opens in the right order.',
    },
  ],
  whyHeading: 'Why convert JPG to PDF?',
  why: [
    { h: 'Send many images as one attachment', x: 'Receipts, ID scans, whiteboard photos and a multi-page contract become one file that opens in the right order, instead of a dozen loose images in an email or chat.' },
    { h: 'Print on real paper sizes', x: 'A4 and Letter pages with a margin print cleanly on any office printer. A wide photo turns the page sideways automatically, so nothing is squashed.' },
    { h: 'No loss of image quality', x: 'JPG and PNG files go into the PDF exactly as they are. The PDF holds the very pixels you gave it, so a sharp scan stays sharp.' },
    { h: 'Private by design', x: 'The PDF is assembled in your browser. Photos of passports, invoices and medical letters never leave your computer.' },
  ],
  howHeading: 'How to convert JPG to PDF, step by step',
  how: [
    { h: 'Open JPG to PDF and drop your images', x: 'Drag one or many JPG, PNG or WebP files onto the drop zone. Use the arrows in the file list to put them in the order you want the pages to appear.' },
    { h: 'Pick a page size', x: 'Under **Options**, set **Page size** to A4, Letter, or **Same as image** to make each page exactly the size of its picture plus the margin.' },
    { h: 'Choose how the image fits', x: '**Fit inside margins** shrinks the picture to fit with nothing cropped. **Fill page** enlarges it to cover the page, cropping what spills over. **Original size** keeps the picture at its real size and only shrinks one that would not fit.' },
    { h: 'Set the margin', x: 'The margin is measured in points, a printer\'s unit; 36 pt is half an inch. Enter 0 for a page with no border.' },
    { h: 'Run JPG to PDF and download', x: 'Click **Run JPG to PDF**. The file `images.pdf` downloads on its own, and you can open it in a new tab to check the page order.' },
  ],
  faqs: [
    { q: 'Does JPG to PDF reduce the quality of my photos?', a: 'No. JPG and PNG files go into the PDF exactly as they are, so the pixels are identical to the originals. WebP, GIF and BMP pictures are read and stored as an exact PNG, which also keeps every pixel.' },
    { q: 'Can I put several images on one page?', a: 'Not with this tool: each image becomes its own page. If you need several pictures side by side on one page, combine them in an image editor first and then convert that single combined picture.' },
    { q: 'Can I change the order of the pages?', a: 'Yes. After dropping the files, use the move arrows in the file list to reorder them before you run the conversion. The PDF follows that order exactly. You can also remove a file from the list.' },
    { q: 'What page size should I use for phone photos?', a: 'Choose **Same as image** if the PDF is only for screens; each page will match the photo. Choose A4 or Letter with **Fit inside margins** if anyone will print it, since a phone photo is taller and narrower than a sheet of paper.' },
    { q: 'Is there a limit on the number of images?', a: 'There is no fixed limit. Because the PDF is built in your browser, the practical ceiling is memory: a few hundred phone photos is fine on a laptop, while thousands of large scans may be slow. Nothing is uploaded, so there is no monthly quota.' },
  ],
  entities: ['JPG', 'JPEG', 'PNG', 'WebP', 'PDF', 'A4', 'Letter'],
  keywords: ['jpg to pdf', 'convert jpg to pdf free', 'combine images into one pdf', 'png to pdf', 'image to pdf converter', 'jpg to pdf a4', 'photos to pdf online'],
  metaTitle: 'JPG to PDF: Combine Images into One PDF Free',
  metaDescription: 'Convert JPG, PNG or WebP to PDF in your browser. Set A4 or Letter, fit or fill and a margin, then download one file with all images in order. Free, no upload.',
}

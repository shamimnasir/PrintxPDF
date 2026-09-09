import type { ToolContent } from './types'

export const jpgToPdf: ToolContent = {
  slug: 'jpg-to-pdf',
  answer:
    'JPG to PDF combines one or more JPG, PNG or WebP images into a single PDF, built in your browser. Choose A4, Letter or a page the same size as each image, decide how the picture fits, set a margin, and download one clean file. Nothing is uploaded.',
  whatHeading: 'What are JPG, PNG, WebP and PDF?',
  what: [
    {
      term: 'What is a JPG?',
      definition:
        'JPG (JPEG, normally wrapped in a JFIF container) is the format cameras and phones save photos in. It uses lossy DCT compression, trading a little fine detail for much smaller files. PDF supports JPEG natively, so this tool places your JPG bytes inside the PDF untouched: no second round of compression, no loss of quality beyond what the camera already applied.',
    },
    {
      term: 'What are PNG and WebP?',
      definition:
        'PNG is a lossless format that stores every pixel exactly, ideal for screenshots and graphics with flat colour and sharp text. WebP is a newer web format from Google that can be lossy or lossless. PDF embeds PNG directly. WebP, GIF and BMP are decoded in your browser and re-encoded as lossless PNG before embedding, so no detail is lost in the step.',
    },
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format, **ISO 32000**) is a fixed-layout page format. Every viewer, phone and printer draws a PDF page the same way, which is why it is the standard container for receipts, forms, scans and portfolios. A PDF can hold many pages in one file, so a folder of photos becomes a single attachment that opens in order.',
    },
  ],
  whyHeading: 'Why convert JPG to PDF?',
  why: [
    { h: 'Send many images as one attachment', x: 'Receipts, ID scans, whiteboard photos and a multi-page contract become one file that opens in the right order, instead of a dozen loose images in an email or chat.' },
    { h: 'Print on real paper sizes', x: 'A4 and Letter pages with a margin print cleanly on any office printer. A photo in landscape turns the page sideways automatically, so nothing is squashed.' },
    { h: 'No loss of image quality', x: 'JPG and PNG files are embedded as they are. The PDF holds exactly the pixels you gave it, so a high-resolution scan stays high-resolution.' },
    { h: 'Private by design', x: 'The PDF is assembled in your browser with **pdf-lib**. Photos of passports, invoices and medical letters never leave your computer.' },
  ],
  howHeading: 'How to convert JPG to PDF, step by step',
  how: [
    { h: 'Open JPG to PDF and drop your images', x: 'Drag one or many JPG, PNG or WebP files onto the drop zone. Use the arrows in the file list to put them in the order you want the pages to appear.' },
    { h: 'Pick a page size', x: 'Under **Options**, set **Page size** to A4, Letter, or **Same as image** to make each page exactly the size of its picture plus the margin.' },
    { h: 'Choose how the image fits', x: '**Fit inside margins** shrinks the picture to fit with nothing cropped. **Fill page** enlarges it to cover the page, cropping the overflow. **Original size** keeps the pixel dimensions and only shrinks an image that would not fit.' },
    { h: 'Set the margin', x: 'The margin is in points; 36 pt is half an inch. Enter 0 for an edge-to-edge page.' },
    { h: 'Run JPG to PDF and download', x: 'Click **Run JPG to PDF**. The file `images.pdf` downloads on its own, and you can open it in a new tab to check the page order.' },
  ],
  faqs: [
    { q: 'Does JPG to PDF reduce the quality of my photos?', a: 'No. JPG and PNG files are embedded in the PDF byte for byte, so the pixels are identical to the originals. WebP, GIF and BMP images are decoded and stored as lossless PNG, which also keeps every pixel.' },
    { q: 'Can I put several images on one page?', a: 'Not with this tool: each image becomes its own page. If you need a contact-sheet layout, combine the images in an image editor first and then convert the single composite image.' },
    { q: 'Can I change the order of the pages?', a: 'Yes. After dropping the files, use the move arrows in the file list to reorder them before you run the conversion. The PDF follows that order exactly. You can also remove a file from the list.' },
    { q: 'What page size should I use for phone photos?', a: 'Choose **Same as image** if the PDF is only for screens; each page will match the photo. Choose A4 or Letter with **Fit inside margins** if anyone will print it, since a phone photo is taller and narrower than a sheet of paper.' },
    { q: 'Is there a limit on the number of images?', a: 'There is no fixed limit. Because the PDF is built in your browser, the practical ceiling is memory: a few hundred phone photos is fine on a laptop, while thousands of large scans may be slow. Nothing is uploaded, so there is no monthly quota.' },
  ],
  entities: ['JPEG', 'JFIF', 'PNG', 'WebP', 'PDF', 'ISO 32000', 'pdf-lib'],
  keywords: ['jpg to pdf', 'convert jpg to pdf free', 'combine images into one pdf', 'png to pdf', 'image to pdf converter', 'jpg to pdf a4', 'photos to pdf online'],
  metaTitle: 'JPG to PDF: Combine Images into One PDF Free',
  metaDescription: 'Convert JPG, PNG or WebP to PDF in your browser. Set A4 or Letter, fit or fill and a margin, then download one file with all images in order. Free, no upload.',
}

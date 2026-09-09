import type { ToolContent } from './types'

export const pdfToJpg: ToolContent = {
  slug: 'pdf-to-jpg',
  answer:
    'PDF to JPG turns each page of a PDF into a separate JPG or PNG image, rendered in your browser at 72 to 300 dpi. Drop the file, pick the format, resolution and pages, then download the images one by one or as a ZIP. Nothing is uploaded.',
  whatHeading: 'What are PDF, JPG and PNG?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'PDF (Portable Document Format) is the page-based file format standardised as **ISO 32000**. Each page stores text, vector shapes, images and fonts at fixed positions, so the file looks the same in every viewer and on every printer. Because the layout is fixed, a page can be drawn to pixels at any resolution you like, which is exactly what a PDF to JPG converter does.',
    },
    {
      term: 'What is a JPG?',
      definition:
        'JPG (JPEG, usually stored in a JFIF container) is the most widely supported photo format. It uses lossy DCT compression: the encoder discards fine detail the eye rarely notices, which keeps files small and viewable everywhere, but leaves faint artefacts around sharp text and thin lines. This tool encodes JPG at quality 90, a sensible balance between size and clarity for page images.',
    },
    {
      term: 'What is a PNG?',
      definition:
        'PNG is a lossless raster format. Every pixel is stored exactly, so text edges, diagrams and screenshots stay crisp and the image survives repeated saves without degrading. The trade-off is size: a PNG page can be several times larger than the same page as a JPG. Choose PNG when small type must stay readable; choose JPG for photo-heavy pages or anything you will attach to an email.',
    },
  ],
  whyHeading: 'Why convert PDF to JPG?',
  why: [
    { h: 'Share a page anywhere an image is accepted', x: 'Chat apps, slide decks, social posts and web pages take an image without asking anyone to open a PDF viewer. A JPG of the page previews inline, on every device.' },
    { h: 'Pick the resolution for the job', x: 'Screen (72 dpi) is small and fast for a preview. Draft print (144 dpi) suits handouts, Good print (216 dpi) suits most flyers, and Full print (300 dpi) matches what a print shop expects.' },
    { h: 'Export only the pages you need', x: 'Type a page range such as `1-3` or `2, 5` and only those pages are rendered. A 200-page manual does not have to become 200 images.' },
    { h: 'Keep the file on your own computer', x: 'Rendering runs inside the browser tab with **pdf.js**. The PDF is never uploaded, so contracts, statements and drafts stay private, and it works offline once the page has loaded.' },
  ],
  howHeading: 'How to convert PDF to JPG, step by step',
  how: [
    { h: 'Open PDF to JPG and drop your PDF', x: 'Drag the file onto the drop zone, or click it to choose a PDF from your computer. The file is read locally.' },
    { h: 'Choose JPG or PNG', x: 'Under **Options**, set **Format** to JPG for the smallest files or PNG for lossless, sharp-edged text.' },
    { h: 'Set the resolution', x: 'Pick **Screen (72 dpi)**, **Draft print (144 dpi)**, **Good print (216 dpi)** or **Full print (300 dpi)**. Higher settings take longer and produce larger images.' },
    { h: 'Type a page range, or leave it blank', x: 'Leave **Pages** empty to export every page, or enter something like `1-3` to render only those pages.' },
    { h: 'Run PDF to JPG and download', x: 'Click **Run PDF to JPG**. A single page downloads straight away. For several pages, choose **Download ZIP** or **Separately** in the results list. Each file is named after the PDF and its page number.' },
  ],
  faqs: [
    { q: 'Is PDF to JPG free, and does it add a watermark?', a: 'Yes, it is free with no sign-up and no watermark. The conversion runs in your browser, so there is no upload queue, no file limit tied to an account, and nothing to delete afterwards.' },
    { q: 'Which resolution should I choose for PDF to JPG?', a: 'Use 72 dpi for a quick preview or a thumbnail, 144 dpi for slides and screens, 216 dpi for good-looking prints, and 300 dpi when a printer or publisher asks for print quality. A 300 dpi A4 page is roughly 2480 by 3508 pixels.' },
    { q: 'Does the tool upload my PDF?', a: 'No. Pages are rendered with pdf.js inside the browser tab and the images are built there too. Close the tab and nothing remains. This makes the tool suitable for contracts, bank statements and unpublished work.' },
    { q: 'Can I convert just one page of a PDF to JPG?', a: 'Yes. Type the page number in the **Pages** field, for example `4`, or a range such as `2-3`. Only those pages are rendered, which is faster and avoids a pile of images you do not need.' },
    { q: 'Why does text look soft in the JPG?', a: 'JPG compression blurs sharp edges slightly, and 72 dpi is too coarse for small type. Switch **Format** to PNG for lossless edges, raise the resolution to 216 or 300 dpi, or both. PNG files are larger but every pixel is kept.' },
  ],
  entities: ['PDF', 'JPEG', 'JFIF', 'PNG', 'ISO 32000', 'DCT compression', 'pdf.js'],
  keywords: ['pdf to jpg', 'convert pdf to jpg free', 'pdf to jpg high quality', 'pdf to png', 'pdf to image converter', 'pdf to jpg 300 dpi', 'pdf page to jpg online'],
  metaTitle: 'PDF to JPG: Convert PDF Pages to JPG or PNG Free',
  metaDescription: 'Convert PDF to JPG or PNG in your browser at up to 300 dpi. Pick the pages and resolution, then download each image or one ZIP. Free, no upload, no sign-up.',
}

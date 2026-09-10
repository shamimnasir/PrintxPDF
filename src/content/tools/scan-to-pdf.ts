import type { ToolContent } from './types'

export const scanToPdf: ToolContent = {
  slug: 'scan-to-pdf',
  answer:
    'Scan to PDF turns your phone camera or webcam into a document scanner. Capture page after page, or drop photos you already took, reorder them, switch on greyscale and auto-contrast, pick A4, Letter or fit-to-image, and save one PDF. Everything runs in your browser; nothing is uploaded.',
  whatHeading: 'What are a scanned PDF and a camera capture?',
  what: [
    {
      term: 'What is a scanned PDF?',
      definition:
        'A scanned PDF is a PDF whose pages are pictures rather than typed text: one photo per page, sized to A4, Letter or the photo itself. It looks and prints like any other PDF and can be signed, merged and emailed, but the words are only part of the picture, so it cannot be searched or copied from until text recognition (OCR) has read it. Receipts, signed forms and ID copies are usually scanned PDFs.',
    },
    {
      term: 'What is a camera capture?',
      definition:
        'A camera capture is a single photo of a page, taken through the browser with your phone camera or webcam and stored as a JPEG picture. This tool limits each capture to 2400 pixels on the longest edge, enough for crisp, readable text at A4, and saves it at high picture quality. Photos you drop in are treated the same way, so a shot taken earlier in your camera app works just as well as a live capture.',
    },
  ],
  whyHeading: 'Why scan to PDF with your camera?',
  why: [
    { h: 'No scanner, no app to install', x: 'A phone or laptop camera and a browser tab are enough. Point, capture, save. Nothing to download or sign up for.' },
    { h: 'Many pages, one file', x: 'Capture a multi-page form or contract page by page, put the shots in order, and save a single PDF that opens the way it should.' },
    { h: 'Cleaner than a plain photo', x: 'Greyscale removes colour tints from indoor lighting; auto-contrast stretches the tones so paper reads white and ink reads black. Both are optional and set per page.' },
    { h: 'Truly private', x: 'Pictures from the camera never leave your device. The PDF is built in the tab, and the camera is switched off the moment you stop it or leave the page.' },
  ],
  howHeading: 'How to scan to PDF with your phone or webcam, step by step',
  how: [
    { h: 'Open Scan to PDF and start the camera', x: 'Click **Start camera** and allow the browser to use it. On a phone, the rear camera is used. You can also skip the camera and drop photos of your pages onto **Or drop photos of your pages**.' },
    { h: 'Capture each page', x: 'Hold the page flat, fill the frame, and click **Capture page**. Repeat for every page; each one appears in the filmstrip with its number. Click **Stop camera** when you are done.' },
    { h: 'Reorder, delete and clean up', x: 'Use the arrows under a thumbnail to move a page earlier or later and the cross to remove it. Tick **Greyscale** or **Auto-contrast** on a page, or use **All greyscale**, **All auto-contrast** and **Reset** in the Document panel.' },
    { h: 'Choose the page size', x: 'Pick **A4**, **Letter** or **Fit image**. With A4 or Letter each photo is placed on a standard page; Fit image makes each page the size of the photo.' },
    { h: 'Save as PDF', x: 'Click **Save as PDF** and the file downloads. Need it searchable? Run the result through [OCR PDF](/tools/ocr-pdf).' },
  ],
  faqs: [
    { q: 'Does Scan to PDF upload my camera pictures?', a: 'No. The camera view, the captured pages and the finished PDF all stay inside your browser tab. Nothing is sent to a server, and the camera is switched off as soon as you click **Stop camera** or leave the page.' },
    { q: 'Can I make the scanned PDF searchable?', a: 'Not in this tool: the pages are pictures. Save the PDF, then open it in [OCR PDF](/tools/ocr-pdf), which reads the text on your device and adds an invisible, selectable copy of it without changing how the page looks.' },
    { q: 'What does auto-contrast do?', a: 'It finds the darkest and lightest one percent of the page and stretches everything between them across the full range, so grey paper becomes white and faint ink becomes dark. It is a simple brightness adjustment, not a straightening tool, so keep the page flat and square when you shoot.' },
    { q: 'Can I use photos I took earlier instead of the camera?', a: 'Yes. Drop JPG or PNG photos onto the drop zone and they join the filmstrip like captured pages. HEIC photos from an iPhone should be converted first with [Image Converter](/tools/image-converter), because most browsers cannot open them.' },
    { q: 'What resolution are the pages?', a: 'Captures and dropped photos are limited to 2400 pixels on the longest edge, about 200 dots per inch on an A4 sheet, which keeps text readable and the PDF small. A ten-page scan is typically a few megabytes.' },
  ],
  entities: ['PDF', 'Scanned document', 'JPEG', 'Phone camera', 'Webcam', 'OCR'],
  keywords: ['scan to pdf', 'scan documents to pdf free', 'phone camera scanner', 'scan to pdf online', 'webcam document scanner', 'photo to pdf scanner', 'scan multiple pages into one pdf'],
  metaTitle: 'Scan to PDF: Use Your Phone Camera or Webcam as a Scanner',
  metaDescription: 'Scan to PDF in your browser: capture pages with your camera or drop photos, reorder, greyscale and auto-contrast, and save one PDF. Free, no upload, no app.',
}

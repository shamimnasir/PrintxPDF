import type { ToolContent } from './types'

export const compressPdf: ToolContent = {
  slug: 'compress-pdf',
  answer:
    'Compress PDF makes a PDF smaller in your browser. Light rewrites the file with compressed object streams and strips metadata, losslessly, keeping the text layer. Medium and Strong re-render every page as a JPEG, which shrinks scans hard but turns text into an image. Free, no upload.',
  whatHeading: 'What is PDF compression?',
  what: [
    {
      term: 'Lossless compression (Light)',
      definition:
        'The Light level rewrites the file structure using **object streams**, a feature of PDF 1.5 that packs the many small objects in a file together and deflates them, and drops the Creator and Keywords metadata. Page content is untouched, so text stays selectable and images keep their pixels. Gains depend on how the file was written: a PDF from an old tool can lose a good share of its size, while a file that is mostly JPEG scans barely changes, because those images are already compressed.',
    },
    {
      term: 'Lossy compression (Medium and Strong)',
      definition:
        'Medium and Strong render each page to a bitmap in your browser and embed it as a JPEG on a page of the same size. Medium renders at about 100 dpi with JPEG quality 72 percent; Strong at 72 dpi and quality 55 percent. This is what shrinks a scanned document dramatically, but the page becomes a picture: **text can no longer be selected, searched or copied**, and links, form fields, bookmarks and annotations are gone. Keep the original if you may need them.',
    },
  ],
  whyHeading: 'Why compress a PDF in the browser?',
  why: [
    { h: 'Get under attachment limits', x: 'Most mail servers cap attachments around 20 to 25 MB. A 40 MB scan at Medium usually lands well under that.' },
    { h: 'Faster uploads to portals', x: 'Application portals and document systems often reject large files or time out. A smaller PDF uploads in a fraction of the time.' },
    { h: 'You see the trade-off', x: 'The result note shows the size before and after and warns when text has become an image, so you can choose Light for a contract and Strong for a photo bundle.' },
    { h: 'Private for financial and medical files', x: 'Bank statements and scans are rendered and rewritten inside the tab. Nothing is uploaded and nothing is stored.' },
    { h: 'Free, no account, no watermark', x: 'There is no daily quota and no sign-up. The only limit is the memory of your browser tab.' },
  ],
  howHeading: 'How to compress a PDF, step by step',
  how: [
    { h: 'Open Compress PDF and drop your file.', x: 'Drag one PDF onto the drop zone or click to browse. The Compression option appears on the right.' },
    { h: 'Pick a compression level.', x: 'Choose **Light · lossless, keeps text** for documents you still need to search, **Medium · pages become images** for scans, or **Strong · smallest, lower quality** when size matters more than sharpness. Start with Light; it never degrades anything.' },
    { h: 'Click Run Compress PDF.', x: 'Light finishes almost at once. Medium and Strong render every page, and the progress bar counts them, so a long scan takes a moment.' },
    { h: 'Read the size note and download.', x: 'The Ready list shows the size before and after, for example `2400 KB → 610 KB (-75%)`. If Light barely moved a scanned file, run again with Medium. The output downloads as `name-compressed.pdf`.' },
  ],
  faqs: [
    {
      q: 'Why did Light barely reduce my PDF?',
      a: 'Because the size is in the images, and they are already compressed. Light only tightens the file structure and removes metadata, which helps files with lots of small objects but does nothing for JPEG scans. For those, Medium re-renders the pages at a lower resolution, which is where the large savings come from.',
    },
    {
      q: 'Will I still be able to select and search text?',
      a: 'With Light, yes: the text layer is untouched. With Medium and Strong, no: each page becomes a JPEG and the words in it are pixels. If you need both a small file and searchable text, compress with Light and then run the result through [OCR PDF](/tools/ocr-pdf) if it is a scan.',
    },
    {
      q: 'How much smaller will my PDF get?',
      a: 'It depends on what is inside. A text-only document from a modern word processor may shrink 5 to 20 percent with Light. A 300 dpi colour scan can drop by 70 to 90 percent at Medium and more at Strong. The result note always shows the exact before and after so you can decide whether to keep it.',
    },
    {
      q: 'Does compressing remove anything besides pixels?',
      a: 'Light removes the Creator and Keywords fields and sets the producer, but keeps the title, author, links, bookmarks and form fields. Medium and Strong rebuild the file from page images, so links, bookmarks, form fields, annotations and the text layer are all dropped. To remove metadata alone, use [Remove Metadata](/tools/remove-metadata).',
    },
    {
      q: 'Is it safe to compress a confidential PDF here?',
      a: 'Yes. Every level runs in your browser with a PDF library loaded alongside the page. The file is never sent to a server, there is no account, and closing the tab discards everything. That makes it suitable for statements, medical records and contracts.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'PDF object streams', 'JPEG', 'Flate compression', 'pdf-lib', 'PDF.js', 'Gmail'],
  keywords: ['compress pdf', 'compress pdf online free', 'reduce pdf file size', 'compress pdf without losing quality', 'shrink pdf for email', 'compress scanned pdf', 'compress pdf without uploading'],
  metaTitle: 'Compress PDF Online Free | Lossless or Smallest',
  metaDescription: 'Compress PDF files in your browser, free. Light is lossless and keeps text; Medium and Strong shrink scans hard by re-rendering pages. Nothing is uploaded.',
}

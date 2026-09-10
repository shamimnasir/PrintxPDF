import type { ToolContent } from './types'

export const compressPdf: ToolContent = {
  slug: 'compress-pdf',
  answer:
    'Compress PDF makes a PDF smaller in your browser. Light tidies the file without losing anything, so you can still search and copy the text. Medium and Strong turn every page into a photo, which shrinks scans a lot but the text can no longer be selected. Free, no upload.',
  whatHeading: 'What is PDF compression?',
  what: [
    {
      term: 'Light: smaller with nothing lost',
      definition:
        'Compression means packing a file to take up less space. Light repacks the inner structure of the PDF more tightly and removes a couple of hidden details saved inside the file, such as the name of the program that made it. The pages themselves are untouched, so text stays selectable and pictures keep every dot. Savings depend on how the file was made: a messy PDF can lose a good share of its size, while a file of scanned photos barely changes, because photos are already packed tight.',
    },
    {
      term: 'Medium and Strong: pages become pictures',
      definition:
        'Medium and Strong draw each page as a photo in your browser and save that photo on a page of the same size. Medium draws at about 100 dots per inch (a measure of sharpness) with 72 percent photo quality; Strong at 72 dots per inch and 55 percent. This is what shrinks a scanned document dramatically, but the page is now a picture: **text can no longer be selected, searched or copied**, and links, fillable fields and bookmarks are gone. Keep the original if you may need them.',
    },
  ],
  whyHeading: 'Why compress a PDF in the browser?',
  why: [
    { h: 'Get under attachment limits', x: 'Most email services cap attachments around 20 to 25 MB. A 40 MB scan at Medium usually lands well under that.' },
    { h: 'Faster uploads to portals', x: 'Application portals and document systems often reject large files or time out. A smaller PDF uploads in a fraction of the time.' },
    { h: 'You see the trade-off', x: 'The result note shows the size before and after and warns when text has become a picture, so you can choose Light for a contract and Strong for a photo bundle.' },
    { h: 'Private for financial and medical files', x: 'Bank statements and scans are shrunk inside the tab. Nothing is uploaded and nothing is stored.' },
    { h: 'Free, no account, no watermark', x: 'There is no daily quota and no sign-up. The only limit is the memory of your browser tab.' },
  ],
  howHeading: 'How to compress a PDF, step by step',
  how: [
    { h: 'Open Compress PDF and drop your file.', x: 'Drag one PDF onto the drop zone or click to browse. The Compression option appears on the right.' },
    { h: 'Pick a compression level.', x: 'Choose **Light · lossless, keeps text** (lossless means nothing is lost) for documents you still need to search, **Medium · pages become images** for scans, or **Strong · smallest, lower quality** when size matters more than sharpness. Start with Light; it never makes anything worse.' },
    { h: 'Click Run Compress PDF.', x: 'Light finishes almost at once. Medium and Strong redraw every page, and the progress bar counts them, so a long scan takes a moment.' },
    { h: 'Read the size note and download.', x: 'The Ready list shows the size before and after, for example `2400 KB → 610 KB (-75%)`. If Light barely moved a scanned file, run again with Medium. The output downloads as `name-compressed.pdf`.' },
  ],
  faqs: [
    {
      q: 'Why did Light barely reduce my PDF?',
      a: 'Because the size is in the pictures, and they are already packed tight. Light only tidies the file structure and removes a few hidden details, which helps messy files but does nothing for scanned photos. For those, Medium redraws the pages at a lower sharpness, which is where the big savings come from.',
    },
    {
      q: 'Will I still be able to select and search text?',
      a: 'With Light, yes: the text is untouched. With Medium and Strong, no: each page becomes a photo and the words in it are just dots. If you need both a small file and searchable text, compress with Light, and if it is a scan, run the result through [OCR PDF](/tools/ocr-pdf) to turn the picture of text back into real text.',
    },
    {
      q: 'How much smaller will my PDF get?',
      a: 'It depends on what is inside. A text-only document from a modern word processor may shrink 5 to 20 percent with Light. A sharp colour scan can drop by 70 to 90 percent at Medium and more at Strong. The result note always shows the exact before and after so you can decide whether to keep it.',
    },
    {
      q: 'Does compressing remove anything besides picture detail?',
      a: 'Light removes two hidden details saved inside the file (the creating program and the keywords), but keeps the title, author, links, bookmarks and fillable fields. Medium and Strong rebuild the file from page photos, so links, bookmarks, fillable fields, notes and the selectable text are all dropped. To remove hidden details only, use [Remove Metadata](/tools/remove-metadata).',
    },
    {
      q: 'Is it safe to compress a confidential PDF here?',
      a: 'Yes. Every level runs in your browser. The file is never sent to a server, there is no account, and closing the tab throws everything away. That makes it suitable for statements, medical records and contracts.',
    },
  ],
  entities: ['PDF', 'PDF compression', 'File size', 'Scanned PDF', 'JPEG', 'Email attachment limit'],
  keywords: ['compress pdf', 'compress pdf online free', 'reduce pdf file size', 'compress pdf without losing quality', 'shrink pdf for email', 'compress scanned pdf', 'compress pdf without uploading'],
  metaTitle: 'Compress PDF Online Free | Keep Text or Go Smallest',
  metaDescription: 'Compress PDF files in your browser, free. Light keeps the text and loses nothing; Medium and Strong shrink scans hard by turning pages into pictures. No upload.',
}

export type ToolCategory = 'organize' | 'optimize' | 'convert' | 'edit' | 'security' | 'more'
export type ToolStatus = 'real' | 'best-effort' | 'server'

export type ToolMeta = {
  slug: string
  name: string
  short: string
  description: string
  icon: string
  category: ToolCategory
  status: ToolStatus
  accept: string
  multiple?: boolean
  /** tools with a bespoke UI instead of the generic shell */
  custom?: 'sign' | 'reader' | 'qr' | 'ocr' | 'organize'
}

export const CATEGORY_LABEL: Record<ToolCategory, string> = {
  organize: 'Organize',
  optimize: 'Optimize',
  convert: 'Convert',
  edit: 'Edit & Sign',
  security: 'Protect',
  more: 'More',
}

export const TOOLS: ToolMeta[] = [
  // organize
  { slug: 'merge-pdf', name: 'Merge PDF', short: 'Combine files into one', description: 'Combine multiple PDF files into one organized document, in the order you choose.', icon: '⧉', category: 'organize', status: 'real', accept: '.pdf', multiple: true },
  { slug: 'split-pdf', name: 'Split PDF', short: 'Break into ranges or pages', description: 'Break a PDF into page ranges, single pages, or every N pages. Download the results as one ZIP or separately.', icon: '✂', category: 'organize', status: 'real', accept: '.pdf' },
  { slug: 'organize-pdf', name: 'Organize Pages', short: 'Reorder, rotate, delete', description: 'See every page as a thumbnail. Drag to reorder, rotate any page, delete what you don\'t need.', icon: '▦', category: 'organize', status: 'real', accept: '.pdf', custom: 'organize' },
  { slug: 'rotate-pdf', name: 'Rotate PDF', short: 'Turn all pages', description: 'Rotate every page in a PDF by 90, 180 or 270 degrees.', icon: '⟳', category: 'organize', status: 'real', accept: '.pdf' },
  { slug: 'delete-pages', name: 'Delete Pages', short: 'Remove pages by number', description: 'Remove specific pages or ranges from a PDF.', icon: '⌫', category: 'organize', status: 'real', accept: '.pdf' },
  { slug: 'extract-pages', name: 'Extract Pages', short: 'Keep only what you need', description: 'Pull out specific pages into a new PDF.', icon: '⇱', category: 'organize', status: 'real', accept: '.pdf' },

  // optimize
  { slug: 'compress-pdf', name: 'Compress PDF', short: 'Shrink file size', description: 'Reduce the size of your PDF by rewriting it with compressed object streams, dropping metadata and, optionally, downsampling images.', icon: '▼', category: 'optimize', status: 'real', accept: '.pdf' },
  { slug: 'repair-pdf', name: 'Repair PDF', short: 'Fix damaged files', description: 'Upload a broken PDF and we rebuild its structure. We recover what we can, partially or in full.', icon: '✚', category: 'optimize', status: 'best-effort', accept: '.pdf' },
  { slug: 'ocr-pdf', name: 'OCR PDF', short: 'Make scans searchable', description: 'Turn scanned PDFs and images into searchable, selectable text with on-device optical character recognition.', icon: '👁', category: 'optimize', status: 'real', accept: '.pdf,.png,.jpg,.jpeg', custom: 'ocr' },
  { slug: 'pdf-reader', name: 'PDF Reader', short: 'Open & read online', description: 'Open and read PDFs with smooth navigation, zoom and page thumbnails. No install needed.', icon: '▤', category: 'optimize', status: 'real', accept: '.pdf', custom: 'reader' },

  // convert
  { slug: 'pdf-to-jpg', name: 'PDF to JPG', short: 'Pages → images', description: 'Export PDF pages as high-quality JPG or PNG images for email, slides and the web.', icon: '▧', category: 'convert', status: 'real', accept: '.pdf' },
  { slug: 'jpg-to-pdf', name: 'JPG to PDF', short: 'Images → one PDF', description: 'Combine JPG, PNG and WebP images into a single clean PDF. Ideal for scans, receipts and photo sets.', icon: '▨', category: 'convert', status: 'real', accept: '.jpg,.jpeg,.png,.webp', multiple: true },
  { slug: 'word-to-pdf', name: 'Word to PDF', short: 'DOCX → PDF', description: 'Convert Word documents to PDFs that look the same everywhere. Links, images and styles intact.', icon: 'W', category: 'convert', status: 'real', accept: '.docx' },
  { slug: 'excel-to-pdf', name: 'Excel to PDF', short: 'XLSX → PDF', description: 'Convert Excel spreadsheets to polished PDFs for sharing, printing and archiving.', icon: 'X', category: 'convert', status: 'real', accept: '.xlsx,.xls,.csv' },
  { slug: 'html-to-pdf', name: 'HTML to PDF', short: 'Web files → PDF', description: 'Turn an HTML file or pasted markup into a clean PDF using the same engine as our web-page printer.', icon: '<>', category: 'convert', status: 'real', accept: '.html,.htm' },
  { slug: 'pdf-to-text', name: 'PDF to Text', short: 'Extract all text', description: 'Pull every line of text out of a PDF into a plain .txt file you can search and reuse.', icon: 'T', category: 'convert', status: 'real', accept: '.pdf' },
  { slug: 'pdf-to-word', name: 'PDF to Word', short: 'PDF → DOCX', description: 'Get an editable Word document from your PDF. Produced in your browser as a text-based .docx; columns, images and exact layout are not preserved.', icon: 'W', category: 'convert', status: 'best-effort', accept: '.pdf' },
  { slug: 'pdf-to-excel', name: 'PDF to Excel', short: 'Tables → XLSX', description: 'Turn PDF tables into an Excel workbook. Runs in your browser: each page becomes a sheet of text lines; ruled table cells are not detected.', icon: 'X', category: 'convert', status: 'best-effort', accept: '.pdf' },
  { slug: 'pdf-to-ppt', name: 'PDF to PowerPoint', short: 'Pages → slides', description: 'Convert PDF pages into editable PowerPoint slides. Runs on our server with LibreOffice: the file is sent over HTTPS, converted and deleted immediately.', icon: 'P', category: 'convert', status: 'server', accept: '.pdf' },
  { slug: 'ppt-to-pdf', name: 'PowerPoint to PDF', short: 'PPTX → PDF', description: 'Turn PowerPoint decks into presentation-ready PDFs. Runs on our server with LibreOffice: the file is sent over HTTPS, converted and deleted immediately.', icon: 'P', category: 'convert', status: 'server', accept: '.pptx,.ppt,.pps,.ppsx,.odp' },
  { slug: 'epub-to-pdf', name: 'EPUB to PDF', short: 'Ebooks → PDF', description: 'Convert EPUB ebooks to A4 PDFs with page numbers for printing and offline reading. Runs on our server with Calibre: the file is sent over HTTPS, converted and deleted immediately.', icon: '📖', category: 'convert', status: 'server', accept: '.epub' },
  { slug: 'mobi-to-pdf', name: 'MOBI to PDF', short: 'Kindle → PDF', description: 'Turn Kindle MOBI, AZW and AZW3 files into clean PDFs you can print and read anywhere. Runs on our server with Calibre: the file is sent over HTTPS, converted and deleted immediately.', icon: '📖', category: 'convert', status: 'server', accept: '.mobi,.azw,.azw3,.prc' },

  // edit & sign
  { slug: 'sign-pdf', name: 'Sign PDF', short: 'Draw or type a signature', description: 'Draw, type or upload a signature, place it on any page, add a date, and download a file ready to share.', icon: '✍', category: 'edit', status: 'real', accept: '.pdf', custom: 'sign' },
  { slug: 'add-watermark', name: 'Add Watermark', short: 'Stamp text on pages', description: 'Stamp PDFs with text. Adjust size, opacity, rotation, colour and which pages to mark, for drafts, copies and confidential documents.', icon: '◈', category: 'edit', status: 'real', accept: '.pdf' },
  { slug: 'page-numbers', name: 'Page Numbers', short: 'Add numbering', description: 'Stamp page numbers in the position and format you choose, and leave a cover page unnumbered.', icon: '#', category: 'edit', status: 'real', accept: '.pdf' },
  { slug: 'edit-metadata', name: 'Edit Metadata', short: 'Title, author, keywords', description: 'Set the title, author, subject and keywords stored inside a PDF.', icon: 'ⓘ', category: 'edit', status: 'real', accept: '.pdf' },

  // security
  { slug: 'flatten-pdf', name: 'Flatten PDF', short: 'Bake forms & annotations', description: 'Flatten form fields so they can no longer be edited, and fix a PDF for archiving.', icon: '▭', category: 'security', status: 'real', accept: '.pdf' },
  { slug: 'remove-metadata', name: 'Remove Metadata', short: 'Scrub personal info', description: 'Strip author, creator, keywords and timestamps from a PDF before you share it.', icon: '⌀', category: 'security', status: 'real', accept: '.pdf' },

  // more
  { slug: 'qr-code', name: 'QR Code Generator', short: 'Print-ready QR codes', description: 'Create print-ready QR codes for links, WiFi, contact cards, email and SMS. Free, right in your browser.', icon: '▩', category: 'more', status: 'real', accept: '', custom: 'qr' },
]

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug)
export const STATUS_LABEL: Record<ToolStatus, string> = { real: 'Runs in your browser', 'best-effort': 'Best effort', server: 'Runs on our server' }

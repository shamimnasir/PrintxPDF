export type ToolCategory = 'organize' | 'optimize' | 'convert' | 'edit' | 'security' | 'more' | 'image' | 'files'
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
  custom?: 'sign' | 'reader' | 'qr' | 'ocr' | 'organize' | 'forms' | 'redact' | 'compare' | 'scan' | 'edit' | 'image' | 'compress-image' | 'zip' | 'unzip'
}

export const CATEGORY_LABEL: Record<ToolCategory, string> = {
  organize: 'Organize',
  optimize: 'Optimize',
  convert: 'Convert',
  edit: 'Edit & Sign',
  security: 'Protect',
  more: 'More PDF tools',
  image: 'Images',
  files: 'Files & QR codes',
}

/** The header menus: each groups a few categories under one plain heading. */
export const MENUS: { id: string; label: string; categories: ToolCategory[] }[] = [
  { id: 'pdf', label: 'PDF Tools', categories: ['organize', 'optimize', 'edit', 'security', 'more'] },
  { id: 'convert', label: 'Convert', categories: ['convert'] },
  { id: 'files', label: 'Images & Files', categories: ['image', 'files'] },
]

export const TOOLS: ToolMeta[] = [
  // organize
  { slug: 'merge-pdf', name: 'Merge PDF', short: 'Combine files into one', description: 'Combine several PDF files into one document, in the order you choose. Nothing is uploaded.', icon: '⧉', category: 'organize', status: 'real', accept: '.pdf', multiple: true },
  { slug: 'split-pdf', name: 'Split PDF', short: 'Break one PDF into several', description: 'Break a PDF into page ranges, single pages, or every few pages. Download the pieces one by one or all together in one ZIP file.', icon: '✂', category: 'organize', status: 'real', accept: '.pdf' },
  { slug: 'organize-pdf', name: 'Organize Pages', short: 'Reorder, rotate, delete pages', description: 'See every page as a small preview. Drag pages into a new order, rotate any page and delete the ones you do not need.', icon: '▦', category: 'organize', status: 'real', accept: '.pdf', custom: 'organize' },
  { slug: 'rotate-pdf', name: 'Rotate PDF', short: 'Turn pages the right way up', description: 'Turn every page in a PDF by 90, 180 or 270 degrees, or only the pages you pick.', icon: '⟳', category: 'organize', status: 'real', accept: '.pdf' },
  { slug: 'delete-pages', name: 'Delete Pages', short: 'Remove pages by number', description: 'Remove the pages you do not want from a PDF. Type the page numbers and download the rest.', icon: '⌫', category: 'organize', status: 'real', accept: '.pdf' },
  { slug: 'extract-pages', name: 'Extract Pages', short: 'Keep only the pages you need', description: 'Pull the pages you need out of a PDF and save them as a new, smaller PDF.', icon: '⇱', category: 'organize', status: 'real', accept: '.pdf' },

  // optimize
  { slug: 'compress-pdf', name: 'Compress PDF', short: 'Shrink the file size', description: 'Make a PDF smaller so it is easier to email and share. Choose a light pass that keeps your text as text, or a stronger one that turns pages into pictures for the smallest file.', icon: '▼', category: 'optimize', status: 'real', accept: '.pdf' },
  { slug: 'repair-pdf', name: 'Repair PDF', short: 'Fix a file that will not open', description: 'Rebuild a damaged PDF that will not open or shows errors. We recover as much as we can, sometimes all of it.', icon: '✚', category: 'optimize', status: 'best-effort', accept: '.pdf' },
  { slug: 'ocr-pdf', name: 'OCR PDF', short: 'Make scans searchable', description: 'Turn a scanned PDF or photo into real text you can search, select and copy. OCR (reading the text out of a picture) runs in your browser, so nothing is uploaded.', icon: '👁', category: 'optimize', status: 'real', accept: '.pdf,.png,.jpg,.jpeg', custom: 'ocr' },
  { slug: 'pdf-reader', name: 'PDF Reader', short: 'Open and read a PDF online', description: 'Open any PDF right in your browser. Flip pages, zoom in and jump around with page previews. Nothing to install.', icon: '▤', category: 'optimize', status: 'real', accept: '.pdf', custom: 'reader' },

  // convert
  { slug: 'pdf-to-jpg', name: 'PDF to JPG', short: 'Save pages as pictures', description: 'Save each page of a PDF as a JPG or PNG picture for email, slides and the web. Pick the quality you need for screen or print.', icon: '▧', category: 'convert', status: 'real', accept: '.pdf' },
  { slug: 'jpg-to-pdf', name: 'JPG to PDF', short: 'Turn pictures into one PDF', description: 'Combine JPG, PNG and WebP pictures into one tidy PDF. Great for scans, receipts and photo sets.', icon: '▨', category: 'convert', status: 'real', accept: '.jpg,.jpeg,.png,.webp', multiple: true },
  { slug: 'word-to-pdf', name: 'Word to PDF', short: 'Word → PDF', description: 'Turn a Word document (.docx) into a PDF that looks the same on every device. Links, pictures and styling stay in place.', icon: 'W', category: 'convert', status: 'real', accept: '.docx' },
  { slug: 'excel-to-pdf', name: 'Excel to PDF', short: 'Excel → PDF', description: 'Turn an Excel spreadsheet into a neat PDF that is ready to share, print or file away.', icon: 'X', category: 'convert', status: 'real', accept: '.xlsx,.xls,.csv' },
  { slug: 'html-to-pdf', name: 'HTML to PDF', short: 'Web page file → PDF', description: 'Turn a saved web page (an .html file) or pasted web page code into a clean PDF, the same way our web page printer does.', icon: '<>', category: 'convert', status: 'real', accept: '.html,.htm' },
  { slug: 'pdf-to-text', name: 'PDF to Text', short: 'Copy out all the text', description: 'Pull all the text out of a PDF into a plain text file (.txt) you can search, copy and reuse anywhere.', icon: 'T', category: 'convert', status: 'real', accept: '.pdf' },
  { slug: 'pdf-to-word', name: 'PDF to Word', short: 'PDF → Word', description: 'Get a Word document (.docx) you can edit from your PDF. It is built in your browser from the text only, so pictures, columns and the exact layout are not kept.', icon: 'W', category: 'convert', status: 'best-effort', accept: '.pdf' },
  { slug: 'pdf-to-excel', name: 'PDF to Excel', short: 'Tables → Excel', description: 'Turn the tables in a PDF into an Excel file. It runs in your browser: each page becomes a sheet of text lines, so boxes drawn with ruled lines are not read as cells.', icon: 'X', category: 'convert', status: 'best-effort', accept: '.pdf' },
  { slug: 'pdf-to-ppt', name: 'PDF to PowerPoint', short: 'Pages → slides', description: 'Turn PDF pages into PowerPoint slides you can edit. The file is sent to our server over a secure connection, converted and deleted right away.', icon: 'P', category: 'convert', status: 'server', accept: '.pdf' },
  { slug: 'ppt-to-pdf', name: 'PowerPoint to PDF', short: 'PowerPoint → PDF', description: 'Turn a PowerPoint deck into a PDF that is ready to present, print or share. The file is sent to our server over a secure connection, converted and deleted right away.', icon: 'P', category: 'convert', status: 'server', accept: '.pptx,.ppt,.pps,.ppsx,.odp' },
  { slug: 'epub-to-pdf', name: 'EPUB to PDF', short: 'Ebook → PDF', description: 'Turn an EPUB ebook into an A4 PDF with page numbers, ready to print or read offline. The file is sent to our server over a secure connection, converted and deleted right away.', icon: '📖', category: 'convert', status: 'server', accept: '.epub' },
  { slug: 'mobi-to-pdf', name: 'MOBI to PDF', short: 'Kindle book → PDF', description: 'Turn Kindle books (MOBI, AZW and AZW3) into clean PDFs you can print and read anywhere. The file is sent to our server over a secure connection, converted and deleted right away.', icon: '📖', category: 'convert', status: 'server', accept: '.mobi,.azw,.azw3,.prc' },

  // edit & sign
  { slug: 'sign-pdf', name: 'Sign PDF', short: 'Draw or type a signature', description: 'Draw, type or upload your signature, put it on any page, add the date and download a file that is ready to send.', icon: '✍', category: 'edit', status: 'real', accept: '.pdf', custom: 'sign' },
  { slug: 'add-watermark', name: 'Add Watermark', short: 'Stamp text across pages', description: 'Stamp words like DRAFT or CONFIDENTIAL across your pages. Pick the size, colour, angle, how see-through it is, and which pages get the stamp.', icon: '◈', category: 'edit', status: 'real', accept: '.pdf' },
  { slug: 'page-numbers', name: 'Page Numbers', short: 'Add page numbers', description: 'Add page numbers where you want them, in the style you choose, and leave the cover page blank if you like.', icon: '#', category: 'edit', status: 'real', accept: '.pdf' },
  { slug: 'edit-metadata', name: 'Edit Metadata', short: 'Change title, author, keywords', description: 'Change the hidden details stored inside a PDF, such as its title, author, subject and keywords.', icon: 'ⓘ', category: 'edit', status: 'real', accept: '.pdf' },

  // security
  { slug: 'flatten-pdf', name: 'Flatten PDF', short: 'Lock form answers in place', description: 'Turn filled-in form boxes into fixed text so the answers can no longer be changed. A good last step before you send or file a form.', icon: '▭', category: 'security', status: 'real', accept: '.pdf' },
  { slug: 'remove-metadata', name: 'Remove Metadata', short: 'Wipe hidden personal details', description: 'Wipe the hidden details stored inside a PDF, such as the author name, the program that made it, keywords and dates, before you share it.', icon: '⌀', category: 'security', status: 'real', accept: '.pdf' },

  // more
  { slug: 'qr-code', name: 'QR Code Generator', short: 'Print-ready QR codes', description: 'Make a QR code for a web link, WiFi login, contact card, email or text message. Free, made in your browser and ready to print.', icon: '▩', category: 'files', status: 'real', accept: '', custom: 'qr' },
  // ---- added to close the gap with the big PDF suites ----
  { slug: 'edit-pdf', name: 'Edit PDF', short: 'Add text, pictures, shapes', description: 'Add text, pictures, boxes and freehand drawing to any page, then save them into the file. Everything happens in your browser on your own copy.', icon: '✎', category: 'edit', status: 'real', accept: '.pdf', custom: 'edit' },
  { slug: 'crop-pdf', name: 'Crop PDF', short: 'Trim the margins', description: 'Cut away the white space around every page, or crop to one area. The trimmed edges are hidden, not deleted, so you can always get them back.', icon: '⌗', category: 'edit', status: 'real', accept: '.pdf' },
  { slug: 'pdf-forms', name: 'Fill PDF Forms', short: 'Find and fill in form boxes', description: 'Finds the boxes in a PDF form, lets you type your answers, and can lock them in place so nobody can change them later.', icon: '☑', category: 'edit', status: 'real', accept: '.pdf', custom: 'forms' },
  { slug: 'redact-pdf', name: 'Redact PDF', short: 'Black out text for good', description: 'Draw a box over anything private. The covered part is turned into a picture, so the words underneath are really gone from the file, not just hidden behind a black box.', icon: '█', category: 'security', status: 'real', accept: '.pdf', custom: 'redact' },
  { slug: 'compare-pdf', name: 'Compare PDFs', short: 'See what changed', description: 'Put two versions of a PDF side by side and highlight every spot that changed, so you can see exactly what is different.', icon: '⇄', category: 'more', status: 'real', accept: '.pdf', multiple: true, custom: 'compare' },
  { slug: 'scan-to-pdf', name: 'Scan to PDF', short: 'Camera to PDF', description: 'Use your phone or webcam as a scanner. Snap page after page, tidy up the contrast and save them as one PDF.', icon: '⎙', category: 'convert', status: 'real', accept: 'image/*', multiple: true, custom: 'scan' },
  { slug: 'pdf-to-markdown', name: 'PDF to Markdown', short: 'PDF → simple text notes', description: 'Turn a PDF into Markdown, a simple text format that keeps headings, lists and links. Ready to paste into notes, a wiki or an AI chat.', icon: 'M', category: 'convert', status: 'real', accept: '.pdf' },
  { slug: 'protect-pdf', name: 'Protect PDF', short: 'Add a password', description: 'Lock a PDF so it only opens with a password, using strong encryption (the file is scrambled until the right password is typed). Browsers cannot do this, so it is done on our server over a secure connection and the file is deleted the moment it is returned.', icon: '🔒', category: 'security', status: 'server', accept: '.pdf' },
  { slug: 'unlock-pdf', name: 'Unlock PDF', short: 'Remove a password', description: 'Take the password off a PDF you are allowed to open, so it stops asking every time. Done on our server over a secure connection; the file is deleted right away.', icon: '🔓', category: 'security', status: 'server', accept: '.pdf' },
  { slug: 'pdf-to-pdfa', name: 'PDF to PDF/A', short: 'Long-term archive PDF', description: 'Convert to PDF/A, the long-term format that archives, courts and government offices ask for, with fonts built in so it still looks right decades from now. The file is sent to our server over a secure connection, converted and deleted right away.', icon: 'A', category: 'convert', status: 'server', accept: '.pdf' },
  // ---- files and images (browser-only, live in src/features/files) ----
  { slug: 'image-converter', name: 'Image Converter', short: 'HEIC, PNG, JPG, WebP, SVG', description: 'Convert iPhone photos (HEIC) and PNG, JPG, WebP, GIF, BMP or SVG pictures into PNG, JPG or WebP. Do as many as you like at once; nothing is uploaded.', icon: '🖼', category: 'image', status: 'real', accept: 'image/*,.heic,.heif,.svg', multiple: true, custom: 'image' },
  { slug: 'compress-image', name: 'Compress Image', short: 'Make pictures smaller', description: 'Shrink photos and screenshots by choosing a quality level and, if you like, a maximum size. See the before and after side by side before you download.', icon: '⇲', category: 'image', status: 'real', accept: 'image/*', multiple: true, custom: 'compress-image' },
  { slug: 'create-zip', name: 'Create ZIP', short: 'Pack files into one ZIP', description: 'Put any files into one ZIP file (a single package that holds many files) without installing anything. It is built in your browser, so even a 200 MB folder never leaves your computer.', icon: '🗜', category: 'files', status: 'real', accept: '*/*', multiple: true, custom: 'zip' },
  { slug: 'extract-zip', name: 'Extract ZIP', short: 'Open a ZIP file', description: 'See what is inside a ZIP file and download one file or all of them, right in your browser. No upload, no extra software.', icon: '📂', category: 'files', status: 'real', accept: '.zip', custom: 'unzip' },
  // ---- ebooks between formats (server: Calibre is already in the container) ----
  { slug: 'ebook-converter', name: 'Ebook Converter', short: 'EPUB ↔ MOBI ↔ AZW3', description: 'Convert ebooks between EPUB, MOBI, AZW3, FB2 and plain text so a book opens on any reader, Kindle included. The file is sent to our server over a secure connection, converted and deleted right away.', icon: '📚', category: 'convert', status: 'server', accept: '.epub,.mobi,.azw,.azw3,.fb2,.txt' },
]

export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug)
export const STATUS_LABEL: Record<ToolStatus, string> = { real: 'Runs in your browser', 'best-effort': 'Works on most files', server: 'Converted on our server' }

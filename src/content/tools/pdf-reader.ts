import type { ToolContent } from './types'

export const pdfReader: ToolContent = {
  slug: 'pdf-reader',
  answer:
    'PDF Reader opens any PDF in your browser with page thumbnails, previous and next navigation, zoom, print and download. Nothing is installed and nothing is uploaded: the file is rendered on your own device. It is free and needs no account.',
  whatHeading: 'What is an online PDF reader?',
  what: [
    {
      term: 'What is an online PDF reader?',
      definition:
        'An online PDF reader is a viewer that runs as a web page instead of a desktop program. This one loads the file into your browser\'s memory, draws each page onto a canvas and lists **thumbnails** down the side so you can jump around. It does not edit, sign or convert; it exists to open, read and print a file quickly on any computer, including one where you cannot install software.',
    },
    {
      term: 'What is a PDF?',
      definition:
        'PDF, the Portable Document Format, is an ISO standard (**ISO 32000**) for documents that look the same on every screen and printer. Each page carries its own text, fonts, images and vector graphics, and a viewer lays them out exactly as the author fixed them. That fixed layout is why PDF is the format for contracts, invoices, forms and anything that must print identically everywhere.',
    },
  ],
  whyHeading: 'Why read a PDF in the browser?',
  why: [
    { h: 'No install, no account', x: 'Open a file on a work laptop, a library machine or a phone without hunting for an app. If the browser is there, the reader is there.' },
    { h: 'The file stays on your device', x: 'Pages are rendered locally, so a bank statement or contract is never uploaded to be displayed. Close the tab and it is gone.' },
    { h: 'See the whole document at a glance', x: 'Thumbnails down the side show the shape of the file: how long it is, where the tables are, which pages are blank. Click one to jump straight there.' },
    { h: 'Check before you send', x: 'Open the PDF you just merged, signed or compressed and confirm the pages, the order and the title are what you meant. Then download or print from the same bar.' },
  ],
  howHeading: 'How to open a PDF online, step by step',
  how: [
    { h: 'Open PDF Reader and drop your file', x: 'Drop a PDF onto the page or click to choose one. Thumbnails render first, then the pages.' },
    { h: 'Move through the pages', x: 'Click any thumbnail, or use the arrows in the top bar. The counter shows the current page and the total.' },
    { h: 'Zoom in or out', x: 'Use the minus and plus buttons; the percentage between them shows the current zoom, from about 40% to 250%.' },
    { h: 'Print, download or close', x: 'Print opens the file in a new tab for the browser\'s print dialog. Download saves it unchanged. Close clears it from the reader.' },
  ],
  faqs: [
    {
      q: 'Does the PDF reader upload my file?',
      a: 'No. The file is read from your disk into browser memory and drawn page by page on your device. Nothing is sent to a server, nothing is stored, and closing the tab removes it entirely.',
    },
    {
      q: 'Can I edit or sign the PDF here?',
      a: 'The reader is view-only. For changes, use [Organize Pages](/tools/organize-pdf) to reorder or rotate, [Sign PDF](/tools/sign-pdf) to add a signature, [Edit PDF](/tools/edit-pdf) to add text and images, or [Add Watermark](/tools/add-watermark). Each opens from the same kind of dropzone.',
    },
    {
      q: 'Can I open a password-protected PDF?',
      a: 'A PDF that needs a password to open cannot be rendered until that password is removed. Run it through [Unlock PDF](/tools/unlock-pdf) first, then open the unlocked copy. Files that only restrict printing or copying open normally.',
    },
    {
      q: 'Does it work on a phone?',
      a: 'Yes. The reader is a web page, so it works in mobile Safari and Chrome. Thumbnails, arrows and zoom respond to touch, and Print opens the file in a new tab you can share or print from.',
    },
  ],
  entities: ['PDF', 'ISO 32000', 'PDF viewer', 'Page thumbnails', 'Portable Document Format', 'Browser rendering'],
  keywords: ['pdf reader online', 'open pdf online', 'read pdf in browser', 'pdf viewer no download', 'view pdf free', 'online pdf reader no install'],
  metaTitle: 'PDF Reader Online: Open and Read PDFs in Your Browser',
  metaDescription: 'PDF reader online: open and read any PDF in your browser with thumbnails, zoom, print and download. Nothing to install, nothing uploaded, free and no account.',
}

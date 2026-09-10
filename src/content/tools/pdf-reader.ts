import type { ToolContent } from './types'

export const pdfReader: ToolContent = {
  slug: 'pdf-reader',
  answer:
    'PDF Reader opens any PDF in your browser with small page previews down the side, next and previous buttons, zoom, print and download. There is nothing to install and nothing is uploaded: the pages are drawn on your own device. It is free and needs no account.',
  whatHeading: 'What is an online PDF reader?',
  what: [
    {
      term: 'What is an online PDF reader?',
      definition:
        'An online PDF reader is a viewer that runs as a web page instead of a program you install. This one loads the file into your browser, draws each page on screen and lists small previews of every page down the side so you can jump around. It does not edit, sign or convert. It exists to open, read and print a file quickly on any computer, including one where you cannot install software.',
    },
    {
      term: 'What is a PDF?',
      definition:
        'A PDF is a file made to look the same on every screen and printer. Each page carries its own text, fonts and pictures in fixed positions, so what the author laid out is exactly what you see. That is why PDF is the format for contracts, invoices, forms and anything that must print the same way everywhere.',
    },
  ],
  whyHeading: 'Why read a PDF in the browser?',
  why: [
    { h: 'No install, no account', x: 'Open a file on a work laptop, a library computer or a phone without hunting for an app. If the browser is there, the reader is there.' },
    { h: 'The file stays on your device', x: 'Pages are drawn on your own computer, so a bank statement or contract is never uploaded to be shown. Close the tab and it is gone.' },
    { h: 'See the whole document at a glance', x: 'The page previews down the side show the shape of the file: how long it is, where the tables are, which pages are blank. Click one to jump straight there.' },
    { h: 'Check before you send', x: 'Open the PDF you just merged, signed or shrunk and confirm the pages, the order and the title are what you meant. Then download or print from the same bar.' },
  ],
  howHeading: 'How to open a PDF online, step by step',
  how: [
    { h: 'Open PDF Reader and drop your file', x: 'Drop a PDF onto the page or click to choose one. The page previews appear first, then the pages.' },
    { h: 'Move through the pages', x: 'Click any page preview, or use the arrows in the top bar. The counter shows the current page and the total.' },
    { h: 'Zoom in or out', x: 'Use the minus and plus buttons. The percentage between them shows the current zoom, from about 40% to 250%.' },
    { h: 'Print, download or close', x: 'Print opens the file in a new tab so you can use your browser\'s print window. Download saves it unchanged. Close clears it from the reader.' },
  ],
  faqs: [
    {
      q: 'Does the PDF reader upload my file?',
      a: 'No. The file is read from your computer into your browser and drawn page by page on your own device. Nothing is sent anywhere, nothing is stored, and closing the tab removes it completely.',
    },
    {
      q: 'Can I edit or sign the PDF here?',
      a: 'The reader is for viewing only. To make changes, use [Organize Pages](/tools/organize-pdf) to reorder or rotate, [Sign PDF](/tools/sign-pdf) to add a signature, [Edit PDF](/tools/edit-pdf) to add text and pictures, or [Add Watermark](/tools/add-watermark). Each opens from the same kind of drop zone.',
    },
    {
      q: 'Can I open a password-protected PDF?',
      a: 'A PDF that asks for a password before it opens cannot be shown until that password is removed. Run it through [Unlock PDF](/tools/unlock-pdf) first, then open the unlocked copy. Files that only block printing or copying open normally.',
    },
    {
      q: 'Does it work on a phone?',
      a: 'Yes. The reader is a web page, so it works in Safari and Chrome on a phone. The page previews, arrows and zoom respond to touch, and Print opens the file in a new tab you can share or print from.',
    },
  ],
  entities: ['PDF', 'PDF viewer', 'Page previews', 'Portable Document Format', 'Web browser'],
  keywords: ['pdf reader online', 'open pdf online', 'read pdf in browser', 'pdf viewer no download', 'view pdf free', 'online pdf reader no install'],
  metaTitle: 'PDF Reader Online: Open and Read PDFs in Your Browser',
  metaDescription: 'PDF reader online: open and read any PDF in your browser with page previews, zoom, print and download. Nothing to install, nothing uploaded, free, no account.',
}

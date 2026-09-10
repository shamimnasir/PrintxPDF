import type { ToolContent } from './types'

export const qrCode: ToolContent = {
  slug: 'qr-code',
  answer:
    'QR Code Generator makes print-ready QR codes for a web address, plain text, WiFi login, email, text message, phone number or contact card. Pick the colours and size, then download as PNG, SVG or an A4 PDF. Codes never expire. It runs in your browser, free.',
  whatHeading: 'What is a QR code?',
  what: [
    {
      term: 'What is a QR code?',
      definition:
        'A QR code is a square pattern of small dark and light blocks that a phone camera can read. The pattern holds text: a web address, a WiFi login, a contact card. The three large squares in the corners help the camera find the code and work out which way up it is. Built-in spare data, called error correction, means the code still scans when part of it is dirty or covered. Codes made here survive about 15% damage.',
    },
    {
      term: 'What is a static QR code?',
      definition:
        'A static code holds the information itself. Scan it and the phone opens the address, joins the WiFi or saves the contact straight away, with no website in between. A dynamic code instead points to a redirect service that can be changed or tracked, and stops working when that service does. Every code made here is static: it cannot be edited after printing, and it can never expire or be switched off.',
    },
  ],
  whyHeading: 'Why generate a QR code here?',
  why: [
    { h: 'Never expires, no subscription', x: 'The information is inside the code. Print it on a sign, a menu or packaging and it will scan in ten years without anyone renewing a plan.' },
    { h: 'Share WiFi without spelling the password', x: 'A WiFi code holds the network name, password and security type. Guests point a camera at it and join.' },
    { h: 'Print at any size', x: 'The SVG download is drawn from lines rather than pixels, so it stays sharp on a business card or a shop window. The PDF puts a 100 mm code on an A4 sheet, ready for the printer.' },
    { h: 'Contact cards that save themselves', x: 'A contact card code (vCard) lets someone add your name, organisation, phone, email and website to their contacts in one scan.' },
    { h: 'No tracking, nothing uploaded', x: 'The code is made in your browser. The address or password you enter is never sent to a server.' },
  ],
  howHeading: 'How to make a QR code, step by step',
  how: [
    { h: 'Open QR Code Generator and pick a type', x: 'Choose a tab: url, text, wifi, email, sms, phone or vcard.' },
    { h: 'Fill in the details', x: 'For a URL, paste the web address. For WiFi, enter the network name (SSID), password and security type (WPA / WPA2, WEP or Open). Email takes a recipient, subject and message; SMS and phone take a number; vCard takes name, organisation, phone, email and website.' },
    { h: 'Style the code', x: 'Set the Dark and Light colours, the PNG size from 128 to 2048 pixels, and the Quiet zone, the blank margin around the code, from 0 to 8 blocks. The preview updates as you type.' },
    { h: 'Scan the preview', x: 'Point your phone at the screen before printing. If it reads, the print will too.' },
    { h: 'Download', x: 'Download PNG for screens and documents, Download SVG for print and design work, or Print-ready PDF for an A4 sheet with the code and its label.' },
  ],
  faqs: [
    {
      q: 'Do these QR codes expire?',
      a: 'No. They are static: the address, text or WiFi details are built into the pattern itself, with no redirect through our website or anyone else\'s. A printed code works for as long as the page or network it points to exists.',
    },
    {
      q: 'Can I track how many people scan it?',
      a: 'Not with a static code, because no website sits between the scan and the destination. If you need counts, paste a link that carries tracking tags, or a short link you control, into the URL field and read the numbers from your own website statistics.',
    },
    {
      q: 'PNG, SVG or PDF: which should I use?',
      a: 'PNG for websites, slides and emails; set the size to at least 512 pixels. SVG for anything a designer or printer will enlarge, because it is drawn from lines and never blurs. PDF when you simply want to print a sheet with the code centred on A4 at 100 mm.',
    },
    {
      q: 'What is the quiet zone and why does it matter?',
      a: 'The quiet zone is the blank margin around the code. Scanners use it to find the edges; without it, codes placed near text or borders often fail. The default of 2 blocks is enough on a plain background; use 4 for busy print layouts.',
    },
    {
      q: 'Does the WiFi code work on iPhone and Android?',
      a: 'Yes. Both camera apps recognise the standard WiFi code format and offer to join. Choose WPA / WPA2 for almost every home and office network. Passwords containing semicolons or backslashes can confuse some phones, so test the preview first.',
    },
  ],
  entities: ['QR code', 'ISO/IEC 18004', 'vCard', 'WiFi QR code', 'Error correction', 'Quiet zone', 'SVG', 'Static QR code'],
  keywords: ['qr code generator', 'qr code generator free', 'wifi qr code', 'vcard qr code', 'qr code svg', 'print ready qr code', 'qr code no expiration', 'qr code pdf'],
  metaTitle: 'QR Code Generator: Free PNG, SVG and Print-Ready PDF',
  metaDescription: 'Free QR code generator for links, WiFi, contact cards, email, SMS and phone. Get PNG, SVG or a print-ready PDF. Made in your browser, and it never expires.',
}

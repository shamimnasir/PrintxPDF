export type Post = { slug: string; title: string; date: string; blurb: string; body: string[] }

export const POSTS: Post[] = [
  {
    slug: 'why-your-printer-hates-the-web',
    title: 'Why your printer hates the web (and how to make peace)',
    date: '2026-08-14',
    blurb: 'Web pages are built for scrolling, not paper. Here is what goes wrong when you hit ⌘P, and what a reader-mode pipeline does about it.',
    body: [
      'A web page is a stack of layouts fighting for attention: a sticky header, a sidebar of "related" links, three ad slots, a cookie banner, and somewhere in the middle, the thing you wanted to read. Your printer sees all of it.',
      'Reader-mode extraction fixes this by scoring every block of the page on how much readable text it holds, how many links it contains, and where it sits in the document. Navigation and ads score low; the article scores high. We keep the winner and throw the rest away.',
      'The second problem is images. A hero photo sized for a 27-inch monitor will happily eat a full sheet of paper. We cap image height by default and let you shrink or remove them per page.',
      'Finally, links. On paper, blue underlined text is noise. You can strip the styling, or, for reference material, print the URL after each link as a footnote.',
    ],
  },
  {
    slug: 'everything-runs-in-your-browser',
    title: 'Everything runs in your browser. Here is how.',
    date: '2026-07-02',
    blurb: 'pdf-lib, pdf.js and Tesseract compiled to WebAssembly mean a static site can merge, split, OCR and sign PDFs without a server.',
    body: [
      'Ten years ago "PDF tool" meant "upload your file to a stranger". Today the browser can parse PDF object streams, rasterise pages, run neural OCR and re-encode images fast enough that the server is optional.',
      'Merging, splitting and rotating operate on the PDF structure directly with pdf-lib: pages are copied by reference, so a 200-page merge finishes in well under a second.',
      'Rendering and text extraction use pdf.js, the same engine Firefox uses for its viewer. Compression at Medium and Strong levels rasterises each page through it and re-embeds a JPEG.',
      'OCR uses Tesseract compiled to WebAssembly. The first run downloads a language pack of a few megabytes; after that it is cached by your browser.',
      'The trade-off is honesty about limits: PowerPoint and EPUB conversion need a real layout engine, so those tools say so instead of faking a progress bar.',
    ],
  },
  {
    slug: 'the-big-image-problem',
    title: 'The big image problem',
    date: '2026-05-20',
    blurb: 'One photo, one page, zero words. A short story about the most common printing complaint and the three fixes for it.',
    body: [
      'The single most common complaint about printing recipes is the photo. A 1600-pixel hero image scales to the full printable width and, on a portrait page, pushes the ingredient list onto page two.',
      'Fix one: cap the height. Our Large setting limits any image to roughly half a page, which keeps the photo without sacrificing the words.',
      'Fix two: shrink. Small floats images at 45% width and 220 pixels tall. Good for step-by-step shots.',
      'Fix three: remove. One click in the Style menu drops every image. The recipe fits on a page again.',
    ],
  },
]


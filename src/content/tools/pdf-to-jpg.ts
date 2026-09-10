import type { ToolContent } from './types'

export const pdfToJpg: ToolContent = {
  slug: 'pdf-to-jpg',
  answer:
    'PDF to JPG turns each page of a PDF into a separate JPG or PNG picture in your browser, at 72 to 300 dpi (dots per inch, a measure of sharpness). Pick the type, sharpness and pages, then download the pictures singly or as a ZIP. Nothing is uploaded.',
  whatHeading: 'What are PDF, JPG and PNG?',
  what: [
    {
      term: 'What is a PDF?',
      definition:
        'A PDF is a file made of pages that look the same in every app and on every printer. Each page keeps its text, shapes, pictures and fonts at fixed positions. Because the layout is fixed, a page can be turned into a picture at any sharpness you like, which is exactly what a PDF to JPG converter does.',
    },
    {
      term: 'What is a JPG?',
      definition:
        'JPG (also written JPEG) is the most common photo format. It keeps files small by quietly dropping fine detail the eye rarely notices. That makes it easy to share anywhere, but it can leave a faint blur around sharp text and thin lines. This tool saves JPG at quality 90 out of 100, a good balance between size and clarity for page pictures.',
    },
    {
      term: 'What is a PNG?',
      definition:
        'PNG is a picture format that keeps every dot exactly as it is, so text edges, diagrams and screenshots stay crisp and the picture never gets worse when you save it again. The trade-off is size: a PNG page can be several times larger than the same page as a JPG. Choose PNG when small text must stay readable; choose JPG for pages full of photos or anything you will email.',
    },
  ],
  whyHeading: 'Why convert PDF to JPG?',
  why: [
    { h: 'Share a page anywhere a picture is accepted', x: 'Chat apps, slides, social posts and web pages take a picture without asking anyone to open a PDF app. A JPG of the page shows up right away, on every device.' },
    { h: 'Pick the sharpness for the job', x: 'Screen (72 dpi) is small and fast for a preview. Draft print (144 dpi) suits handouts, Good print (216 dpi) suits most flyers, and Full print (300 dpi) is what a print shop expects.' },
    { h: 'Save only the pages you need', x: 'Type a page range such as `1-3` or `2, 5` and only those pages are made. A 200-page manual does not have to become 200 pictures.' },
    { h: 'Keep the file on your own computer', x: 'The pictures are made inside your browser tab. The PDF is never uploaded, so contracts, statements and drafts stay private, and it works offline once the page has loaded.' },
  ],
  howHeading: 'How to convert PDF to JPG, step by step',
  how: [
    { h: 'Open PDF to JPG and drop your PDF', x: 'Drag the file onto the drop zone, or click it to choose a PDF from your computer. The file is read on your own device.' },
    { h: 'Choose JPG or PNG', x: 'Under **Options**, set **Format** to JPG for the smallest files or PNG for the sharpest text.' },
    { h: 'Set the sharpness', x: 'Pick **Screen (72 dpi)**, **Draft print (144 dpi)**, **Good print (216 dpi)** or **Full print (300 dpi)**. Higher settings take longer and make larger pictures.' },
    { h: 'Type a page range, or leave it blank', x: 'Leave **Pages** empty to save every page, or enter something like `1-3` to make only those pages.' },
    { h: 'Run PDF to JPG and download', x: 'Click **Run PDF to JPG**. A single page downloads straight away. For several pages, choose **Download ZIP** or **Separately** in the results list. Each file is named after the PDF and its page number.' },
  ],
  faqs: [
    { q: 'Is PDF to JPG free, and does it add a watermark?', a: 'Yes, it is free with no sign-up and no watermark. The conversion runs in your browser, so there is no waiting line, no file limit tied to an account, and nothing to delete afterwards.' },
    { q: 'Which sharpness should I choose for PDF to JPG?', a: 'Use 72 dpi for a quick preview or a small thumbnail, 144 dpi for slides and screens, 216 dpi for good-looking prints, and 300 dpi when a printer or publisher asks for print quality. A 300 dpi A4 page is roughly 2480 by 3508 dots.' },
    { q: 'Does the tool upload my PDF?', a: 'No. The pages are drawn and the pictures are built inside your browser tab. Close the tab and nothing remains. This makes the tool safe for contracts, bank statements and unpublished work.' },
    { q: 'Can I convert just one page of a PDF to JPG?', a: 'Yes. Type the page number in the **Pages** field, for example `4`, or a range such as `2-3`. Only those pages are made, which is faster and avoids a pile of pictures you do not need.' },
    { q: 'Why does text look soft in the JPG?', a: 'JPG softens sharp edges a little, and 72 dpi is too coarse for small text. Switch **Format** to PNG for crisp edges, raise the sharpness to 216 or 300 dpi, or do both. PNG files are larger but every dot is kept.' },
  ],
  entities: ['PDF', 'JPEG', 'PNG', 'Image resolution', 'Dots per inch', 'ZIP archive'],
  keywords: ['pdf to jpg', 'convert pdf to jpg free', 'pdf to jpg high quality', 'pdf to png', 'pdf to image converter', 'pdf to jpg 300 dpi', 'pdf page to jpg online'],
  metaTitle: 'PDF to JPG: Convert PDF Pages to JPG or PNG Free',
  metaDescription: 'Convert PDF to JPG or PNG in your browser at up to 300 dpi. Pick the pages and sharpness, then download each picture or one ZIP. Free, no upload, no sign-up.',
}

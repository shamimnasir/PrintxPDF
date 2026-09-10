import type { ToolContent } from './types'

export const ebookConverter: ToolContent = {
  slug: 'ebook-converter',
  answer:
    'Ebook Converter changes an ebook from one format to another: EPUB, MOBI, AZW3, FB2 or TXT. Drop the file, pick the format you want in the Convert to menu and click Run. Our converter keeps the cover, chapters and pictures, sends the new file back and deletes yours straight away.',
  whatHeading: 'What are EPUB, MOBI, AZW3, FB2 and TXT?',
  what: [
    {
      term: 'What is EPUB?',
      definition:
        'EPUB is the most common open ebook format, the one most reading apps and devices understand. An .epub file holds the chapters, pictures and typefaces of a book, plus a list that sets the reading order and the table of contents. Its text reflows, meaning it re-wraps to fit whatever screen and text size you choose. Apple Books, Kobo, Google Play Books and current Kindles (by sending the file to them) all read it.',
    },
    {
      term: 'What is MOBI or AZW3?',
      definition:
        'MOBI is the old Kindle format from the earliest Kindle devices. It handles only simple formatting and cannot carry its own typefaces. AZW3 is Amazon\'s newer Kindle format, with proper styling, built-in typefaces and tables. Kindle devices and apps open both when you copy the file across yourself. MOBI is only the safer choice for Kindles made before 2011. Apple Books and Kobo cannot open either, which is why people convert.',
    },
    {
      term: 'What is FB2?',
      definition:
        'FB2 (FictionBook 2) is an ebook format popular in Russia and Eastern Europe. Instead of describing how the text should look, one .fb2 file describes what each part is: a paragraph, a poem, a quote, a note, with pictures tucked inside. Reading apps such as FBReader and Cool Reader, and PocketBook devices, open it directly, and it converts to and from EPUB without losing the structure.',
    },
    {
      term: 'What is a TXT ebook?',
      definition:
        'A .txt file is plain text with no formatting, pictures or table of contents: only the words, line breaks and paragraph gaps. It is the most portable format of all, opening on every device ever made, and it is the right choice when you want to search a book, feed it to a screen reader or edit it. Converting to TXT drops the cover, typefaces and layout on purpose.',
    },
  ],
  whyHeading: 'Why convert between ebook formats?',
  why: [
    {
      h: 'Open a book on the device you actually own',
      x: 'Kindles want AZW3 or MOBI; Apple Books, Kobo and most Android readers want EPUB. Converting turns a file that will not open into one that does, cover and chapters intact.',
    },
    {
      h: 'Move your library to a new reader',
      x: 'Switching from Kindle to Kobo, or the other way, does not have to mean losing the books you own without copy protection. Run them through the converter one at a time and carry on reading.',
    },
    {
      h: 'Upgrade old MOBI files to AZW3',
      x: 'AZW3 supports built-in typefaces, real tables and better-looking text. Converting an old MOBI to AZW3 lets a modern Kindle show it properly.',
    },
    {
      h: 'Get plain text for search, editing or accessibility',
      x: 'TXT output strips everything but the words, which is ideal for searching, quoting, screen readers and read-aloud tools.',
    },
    {
      h: 'Deleted the moment it is done',
      x: 'The book travels over a secure connection to our converter, is changed into the new format, and the upload is removed as soon as the result is sent back.',
    },
  ],
  howHeading: 'How to convert an ebook, step by step',
  how: [
    {
      h: 'Open Ebook Converter and drop your book',
      x: 'Drag an .epub, .mobi, .azw, .azw3, .fb2 or .txt file onto the drop zone. One book at a time, up to 100 MB.',
    },
    {
      h: 'Pick the format you want in Convert to',
      x: 'Choose **EPUB** for Apple Books, Kobo and most readers, **AZW3** for Kindle, **MOBI** for older Kindles, **FB2** for FBReader and PocketBook, or **Plain text**.',
    },
    {
      h: 'Run Ebook Converter',
      x: 'Click **Run Ebook Converter**. The file is sent over a secure connection to our converter and rebuilt in the new format. There are no page settings here: the reading device decides the page.',
    },
    {
      h: 'Download and copy it to your reader',
      x: 'The converted book downloads automatically and the upload is deleted at once. Copy it over by cable, email it to your Kindle address or open it in your reading app.',
    },
  ],
  faqs: [
    {
      q: 'Can I convert a copy-protected ebook?',
      a: 'No. Books bought from a store with copy protection (often called DRM) are locked to your account, and the converter cannot open them: it spots the lock and returns an error instead of a file. Books without copy protection, including most from independent publishers and self-published authors, convert normally.',
    },
    {
      q: 'Will the cover, table of contents and pictures be kept?',
      a: 'Yes, wherever the new format can hold them. EPUB, AZW3, MOBI and FB2 keep the cover, chapter structure and pictures. TXT keeps only the text, by design.',
    },
    {
      q: 'Which format should I choose for a Kindle?',
      a: 'AZW3. It is the format modern Kindles and Kindle apps use for books you copy across yourself, with built-in typefaces and full styling. Choose MOBI only for a Kindle made before 2011. Current Kindles also accept EPUB through Send to Kindle.',
    },
    {
      q: 'Is the converted book identical to the original?',
      a: 'The text, order and pictures are the same. Layout may differ, because each format supports different styling: MOBI drops built-in typefaces and some styling, FB2 keeps structure rather than looks, and TXT keeps words only. EPUB to AZW3 and back loses almost nothing.',
    },
    {
      q: 'What are the limits and is the file kept?',
      a: 'Files up to 100 MB, 2 minutes per conversion. The upload is deleted the moment the result is returned. The free plan includes 5 server conversions a month, Pro 300 and the API plan 5,000, see [pricing](/pricing).',
    },
  ],
  entities: ['EPUB', 'MOBI', 'AZW3', 'FB2', 'Ebook', 'Amazon Kindle', 'Apple Books', 'Kobo'],
  keywords: [
    'ebook converter',
    'epub to mobi',
    'epub to azw3',
    'mobi to epub converter',
    'azw3 to epub',
    'fb2 to epub',
    'convert ebook for kindle',
  ],
  metaTitle: 'Ebook Converter: EPUB, MOBI, AZW3, FB2 and TXT Online',
  metaDescription:
    'Convert ebooks between EPUB, MOBI, AZW3, FB2 and TXT. Cover and chapters are kept, so the book opens on any reader. Your file is deleted right after download.',
}

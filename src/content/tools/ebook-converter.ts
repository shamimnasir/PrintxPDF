import type { ToolContent } from './types'

export const ebookConverter: ToolContent = {
  slug: 'ebook-converter',
  answer:
    'Convert an ebook between EPUB, MOBI, AZW3, FB2 and TXT by dropping the file into Ebook Converter, choosing the target in the Convert to menu and clicking Run. Our server reflows it with Calibre, keeps the cover, chapters and images, returns the new file and deletes yours immediately.',
  whatHeading: 'What are EPUB, MOBI, AZW3, FB2 and TXT?',
  what: [
    {
      term: 'What is EPUB?',
      definition:
        'EPUB is the open ebook standard maintained by the W3C. An .epub is a ZIP archive of XHTML chapters, CSS, images, fonts and a manifest that sets reading order and the table of contents; EPUB 3 adds audio, video and MathML. It is reflowable, so text re-wraps to the screen and font size the reader picks. Apple Books, Kobo, Google Play Books, Calibre and current Kindle devices (by import) all read it.',
    },
    {
      term: 'What is MOBI or AZW3?',
      definition:
        'MOBI is the legacy Mobipocket format used by the earliest Kindles: a single reflowable container with limited formatting and no embedded fonts. AZW3 is Amazon\'s KF8 (Kindle Format 8) successor, with full HTML5 and CSS3 styling, embedded fonts and tables. Kindle devices and apps open both when sideloaded; MOBI is the safer choice only for Kindles made before 2011. Neither is read natively by Apple Books or Kobo, which is why people convert.',
    },
    {
      term: 'What is FB2?',
      definition:
        'FB2 (FictionBook 2) is an XML ebook format popular in Russia and Eastern Europe. One .fb2 file describes the book semantically, with tags for paragraphs, poems, epigraphs and notes, and images embedded as Base64, rather than describing how the text should look. Readers such as FBReader, Cool Reader and PocketBook devices support it directly, and Calibre converts it to and from EPUB without losing structure.',
    },
    {
      term: 'What is a TXT ebook?',
      definition:
        'A .txt file is plain text with no formatting, images or table of contents: only the words, line breaks and paragraph gaps. It is the most portable format of all, opening on every device ever made, and it is the right target when you want to search a book, feed it to a screen reader or edit it. Converting to TXT discards the cover, fonts and layout on purpose.',
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
      x: 'Switching from Kindle to Kobo, or the other way, does not have to mean losing your DRM-free books. Batch them through the converter one at a time and carry on reading.',
    },
    {
      h: 'Upgrade old MOBI files to AZW3',
      x: 'KF8 supports embedded fonts, real tables and better typography. Converting a legacy MOBI to AZW3 lets a modern Kindle render it properly.',
    },
    {
      h: 'Get plain text for search, editing or accessibility',
      x: 'TXT output strips everything but the words, which is ideal for full-text search, quoting, screen readers and text-to-speech tools.',
    },
    {
      h: 'Deleted the moment it is done',
      x: 'The book travels over HTTPS to an isolated container, Calibre converts it, and the upload is removed as soon as the result is sent back.',
    },
  ],
  howHeading: 'How to convert an ebook, step by step',
  how: [
    {
      h: 'Open Ebook Converter and drop your book',
      x: 'Drag an .epub, .mobi, .azw, .azw3, .fb2 or .txt file onto the drop zone. One book at a time, up to 100 MB.',
    },
    {
      h: 'Pick the target format in Convert to',
      x: 'Choose **EPUB** for Apple Books, Kobo and most readers, **AZW3** for Kindle, **MOBI** for older Kindles, **FB2** for FBReader and PocketBook, or **Plain text**.',
    },
    {
      h: 'Run Ebook Converter',
      x: 'Click **Run Ebook Converter**. The file is sent over HTTPS to our converter and reflowed by Calibre into the new container. There are no page settings here: the reader decides the page.',
    },
    {
      h: 'Download and copy it to your reader',
      x: 'The converted book downloads automatically and the upload is deleted at once. Sideload it over USB, email it to your Kindle address or open it in your reading app.',
    },
  ],
  faqs: [
    {
      q: 'Can I convert a DRM-protected ebook?',
      a: 'No. Books bought with DRM from a store are encrypted to your account, and the converter cannot open them: the server detects the DRM and returns an error instead of a file. DRM-free books, including most from independent publishers and self-published authors, convert normally.',
    },
    {
      q: 'Will the cover, table of contents and images be kept?',
      a: 'Yes, wherever the target format can hold them. EPUB, AZW3, MOBI and FB2 keep the cover, chapter structure and inline images. TXT keeps only the text, by design.',
    },
    {
      q: 'Which format should I choose for a Kindle?',
      a: 'AZW3. It is the KF8 format modern Kindles and Kindle apps use for sideloaded books, with embedded fonts and full styling. Choose MOBI only for a Kindle made before 2011. Current Kindles also accept EPUB through Send to Kindle.',
    },
    {
      q: 'Is the converted book identical to the original?',
      a: 'The text, order and images are the same. Layout may differ, because each format supports different styling: MOBI drops embedded fonts and some CSS, FB2 keeps structure rather than appearance, and TXT keeps words only. EPUB to AZW3 and back is close to lossless.',
    },
    {
      q: 'What are the limits and is the file kept?',
      a: 'Files up to 100 MB, 2 minutes per conversion. The upload is deleted the moment the result is returned. The free plan includes 5 server conversions a month, Pro 300 and the API plan 5,000, see [pricing](/pricing).',
    },
  ],
  entities: ['EPUB', 'MOBI', 'AZW3', 'KF8', 'FB2', 'Calibre', 'Amazon Kindle', 'Apple Books'],
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
    'Convert ebooks between EPUB, MOBI, AZW3, FB2 and TXT on our server with Calibre. Cover and chapters kept, so it opens on any reader. Deleted after download.',
}

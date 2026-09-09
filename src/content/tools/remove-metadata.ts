import type { ToolContent } from './types'

export const removeMetadata: ToolContent = {
  slug: 'remove-metadata',
  answer:
    'Remove Metadata clears the title, author, subject, keywords, creator and producer fields from a PDF and resets its creation and modification dates. The scrubbed file downloads as a clean copy. Everything runs in your browser, so the document is never uploaded, and it is free with no account.',
  whatHeading: 'What is PDF metadata?',
  what: [
    {
      term: 'What is PDF metadata?',
      definition:
        'Metadata is data about the document rather than in it: the title, the author (often a login name), the subject, keywords, the application and version that made it, and timestamps. It is invisible on the page but readable by anyone with a viewer or a command line. That is how an anonymous-looking PDF ends up naming its author, the firm\'s software licence or the exact minute it was last edited.',
    },
    {
      term: 'What is the Info dictionary?',
      definition:
        'The document information dictionary is the block in a PDF where these fields live, defined in **ISO 32000**. This tool sets every one of its text entries to empty and both dates to the Unix epoch, so nothing personal or historical remains in it. A separate **XMP** packet, an XML block some design tools add, is not rewritten; see the questions below.',
    },
  ],
  whyHeading: 'Why remove metadata from a PDF?',
  why: [
    { h: 'Stop leaking names', x: 'The author field usually holds whoever installed the software, and the creator names the tool and version. Neither belongs in a file sent to a journalist, a counterparty or the public.' },
    { h: 'Protect sources and clients', x: 'Legal, HR and press work often depends on a document not revealing where it came from. Metadata is the first place anyone looks.' },
    { h: 'Data minimisation', x: 'Privacy rules such as GDPR expect you to share no more personal data than necessary. Names and timestamps in metadata are personal data you do not need to send.' },
    { h: 'Remove stale or wrong values', x: 'A template\'s original title and author travel with every file made from it. Clearing them stops one client seeing another client\'s name.' },
    { h: 'Nothing leaves your machine', x: 'The file is opened and rewritten in your browser. No upload, no copy on a server.' },
  ],
  howHeading: 'How to remove PDF metadata, step by step',
  how: [
    { h: 'Open Remove Metadata and drop your PDF', x: 'Drop one file. There are no options; every field is cleared.' },
    { h: 'Click Run Remove Metadata', x: 'Title, author, subject, keywords, creator and producer are emptied and the creation and modification dates reset.' },
    { h: 'Download the clean copy', x: 'The file arrives as `name-clean.pdf`.' },
    { h: 'Verify', x: 'Open it in [PDF Reader](/tools/pdf-reader): the top bar shows the file name instead of a title and no author. For a full check, view the document properties in a desktop viewer.' },
  ],
  faqs: [
    {
      q: 'What exactly does Remove Metadata delete?',
      a: 'The Info dictionary fields: Title, Author, Subject, Keywords, Creator and Producer, all set to empty, plus CreationDate and ModDate, reset to 1 January 1970. Page content, images, links, bookmarks and form fields are unchanged.',
    },
    {
      q: 'Does it remove XMP metadata?',
      a: 'Not directly. If the file carries an XMP packet, typically added by design and publishing software, that XML block is left in place and may still hold the old title or author. Check the document properties in a desktop viewer after cleaning, and if XMP remains, re-export the PDF from its source without metadata.',
    },
    {
      q: 'Does it remove comments, hidden text or attachments?',
      a: 'No. Those are content, not metadata. Delete comments in an editor, use [Redact PDF](/tools/redact-pdf) for text that must disappear, and [Flatten PDF](/tools/flatten-pdf) for form fields. Metadata scrubbing is one step in a sanitising checklist, not the whole of it.',
    },
    {
      q: 'Why do the dates show 1970 instead of being blank?',
      a: 'PDF viewers expect a date value, so the tool writes the earliest one, the Unix epoch, rather than leaving a broken entry. It carries no information about when you actually created or edited the file.',
    },
    {
      q: 'Is it free and private?',
      a: 'Yes. No account, no upload, no limit. The file is processed in your browser and the original on your disk is never touched; you download a new copy.',
    },
  ],
  entities: ['PDF metadata', 'Info dictionary', 'XMP', 'Author field', 'Producer', 'GDPR', 'Document sanitisation'],
  keywords: ['remove pdf metadata', 'remove metadata from pdf free', 'strip pdf metadata', 'delete author from pdf', 'anonymize pdf', 'pdf metadata remover online', 'clean pdf before sharing'],
  metaTitle: 'Remove PDF Metadata: Strip Author and Dates, Free',
  metaDescription: 'Remove PDF metadata free: strip the author, title, keywords, creator and timestamps before you share a file. Scrubbed in your browser, nothing is uploaded.',
}

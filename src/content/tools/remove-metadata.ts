import type { ToolContent } from './types'

export const removeMetadata: ToolContent = {
  slug: 'remove-metadata',
  answer:
    'Remove Metadata clears the hidden details saved inside a PDF: the title, author, subject, keywords, the app that made it, and the creation and edit dates. You download a clean copy. Everything runs in your browser, so the document is never uploaded, and it is free with no account.',
  whatHeading: 'What is PDF metadata?',
  what: [
    {
      term: 'What is PDF metadata?',
      definition:
        'Metadata is the set of hidden details saved inside a file, such as its title, author and dates. In a PDF that includes the author (often a login name), the subject, keywords, the app and version that made it, and the exact time it was created and last edited. None of it shows on the page, but anyone can read it from the file properties. That is how an anonymous-looking PDF ends up naming its author, the firm\'s software or the minute it was last changed.',
    },
    {
      term: 'Where does a PDF keep these details?',
      definition:
        'A PDF stores these details in a small block near the end of the file, called the document information block. This tool sets every text entry in it to empty and both dates to the earliest date a PDF can hold, so nothing personal or historical remains there. Some design and publishing apps also add a second, longer block of details, called XMP. That block is not rewritten; see the questions below.',
    },
  ],
  whyHeading: 'Why remove metadata from a PDF?',
  why: [
    { h: 'Stop leaking names', x: 'The author field usually holds whoever installed the software, and the creator field names the app and version. Neither belongs in a file sent to a journalist, the other side of a deal or the public.' },
    { h: 'Protect sources and clients', x: 'Legal, HR and press work often depends on a document not revealing where it came from. The hidden details are the first place anyone looks.' },
    { h: 'Share less personal data', x: 'Privacy rules such as GDPR expect you to share no more personal data than necessary. Names and dates hidden in the file are personal data you do not need to send.' },
    { h: 'Remove stale or wrong values', x: 'A template\'s original title and author travel with every file made from it. Clearing them stops one client seeing another client\'s name.' },
    { h: 'Nothing leaves your machine', x: 'The file is opened and rewritten in your browser. No upload, no copy on a server.' },
  ],
  howHeading: 'How to remove PDF metadata, step by step',
  how: [
    { h: 'Open Remove Metadata and drop your PDF', x: 'Drop one file. There are no options; every field is cleared.' },
    { h: 'Click Run Remove Metadata', x: 'Title, author, subject and keywords are emptied, along with the creator and producer fields (the apps that made and saved the file), and the creation and edit dates are reset.' },
    { h: 'Download the clean copy', x: 'The file arrives as `name-clean.pdf`.' },
    { h: 'Check the result', x: 'Open it in [PDF Reader](/tools/pdf-reader): the top bar shows the file name instead of a title and no author. For a full check, view the file properties in a desktop PDF app.' },
  ],
  faqs: [
    {
      q: 'What exactly does Remove Metadata delete?',
      a: 'The document information fields: Title, Author, Subject, Keywords, Creator and Producer, all set to empty, plus the creation and last-edited dates, reset to 1 January 1970. Page content, pictures, links, bookmarks and form fields are unchanged.',
    },
    {
      q: 'Does it remove XMP metadata?',
      a: 'Not directly. If the file carries an XMP block, a second set of details typically added by design and publishing software, it is left in place and may still hold the old title or author. Check the file properties in a desktop PDF app after cleaning, and if details remain, export the PDF again from its source without them.',
    },
    {
      q: 'Does it remove comments, hidden text or attachments?',
      a: 'No. Those are content, not hidden details. Delete comments in an editor, use [Redact PDF](/tools/redact-pdf) for text that must disappear, and [Flatten PDF](/tools/flatten-pdf) for form fields. Clearing the hidden details is one step in a clean-up checklist, not the whole of it.',
    },
    {
      q: 'Why do the dates show 1970 instead of being blank?',
      a: 'PDF apps expect a date value, so the tool writes the earliest one the format can hold, 1 January 1970, rather than leaving a broken entry. It says nothing about when you actually created or edited the file.',
    },
    {
      q: 'Is it free and private?',
      a: 'Yes. No account, no upload, no limit. The file is processed in your browser and the original on your disk is never touched; you download a new copy.',
    },
  ],
  entities: ['PDF metadata', 'Document information', 'XMP', 'Author field', 'File properties', 'GDPR', 'Document sanitisation'],
  keywords: ['remove pdf metadata', 'remove metadata from pdf free', 'strip pdf metadata', 'delete author from pdf', 'anonymize pdf', 'pdf metadata remover online', 'clean pdf before sharing'],
  metaTitle: 'Remove PDF Metadata: Clear Hidden Author and Dates, Free',
  metaDescription: 'Remove PDF metadata free: clear the hidden author, title, keywords, app name and dates before you share a file. Cleaned in your browser, nothing is uploaded.',
}

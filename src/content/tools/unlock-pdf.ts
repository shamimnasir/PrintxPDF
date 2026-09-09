import type { ToolContent } from './types'

export const unlockPdf: ToolContent = {
  slug: 'unlock-pdf',
  answer:
    'Unlock a PDF by dropping it into Unlock PDF, entering the password if the file asks for one on opening, and clicking Run. Our server removes the encryption with qpdf, returns a copy that opens without a password and allows printing and copying, then deletes your upload immediately.',
  whatHeading: 'What is a locked PDF?',
  what: [
    {
      term: 'What is a user password on a PDF?',
      definition:
        'A user password (also called the open password) is the one a reader demands before showing a single page. The document\'s contents are encrypted with a key derived from it, so without the password there is nothing to read. Unlock PDF needs this password: it decrypts the file with it and saves a copy with no encryption, so the PDF stops asking every time you, a colleague or a document system opens it.',
    },
    {
      term: 'What is an owner password on a PDF?',
      definition:
        'An owner password protects only the permission flags: printing, copying text, editing, annotating and form filling. A PDF with an owner password and no user password opens normally, but the viewer greys out Print or Copy. Because the content key is not secret in that case, the restrictions can be removed without knowing the owner password at all. Leave the password field empty and Unlock PDF strips them.',
    },
    {
      term: 'What encryption do PDFs use?',
      definition:
        'PDF encryption ranges from the old 40-bit and 128-bit RC4 revisions through 128-bit AES to the current revision 6 AES-256 defined in PDF 2.0. qpdf, which runs on our server, reads every revision. If the correct password is supplied, or none is required, the result is a standard unencrypted PDF with the same pages, fonts, images, bookmarks and form fields, ready for any tool that refuses encrypted input.',
    },
  ],
  whyHeading: 'Why unlock a PDF?',
  why: [
    {
      h: 'Stop typing the password every time',
      x: 'A statement, contract or manual you open weekly should not ask for a password on each visit. Save an unlocked copy in a folder you already keep secure.',
    },
    {
      h: 'Print and copy from a file you own',
      x: 'Publishers and payroll systems often set owner-only restrictions. If you have the right to the document, unlocking restores Print and Copy in every viewer.',
    },
    {
      h: 'Feed it to other tools',
      x: 'Merging, splitting, OCR and archiving tools refuse encrypted PDFs. Unlock first, then run [Merge PDF](/tools/merge-pdf), [OCR PDF](/tools/ocr-pdf) or [PDF to PDF/A](/tools/pdf-to-pdfa).',
    },
    {
      h: 'Deleted the moment it is returned',
      x: 'The file goes over HTTPS to an isolated container, qpdf decrypts it, and the upload is removed as soon as the unlocked copy is sent back. The password stays in memory and is never logged.',
    },
  ],
  howHeading: 'How to unlock a PDF, step by step',
  how: [
    {
      h: 'Open Unlock PDF and drop the locked file',
      x: 'Drag the PDF onto the drop zone or click to browse. One file at a time, up to 100 MB.',
    },
    {
      h: 'Enter the password, or leave it blank',
      x: 'If the PDF asks for a password when you open it, type that password. If it opens fine but blocks printing or copying, leave the **Password** field empty.',
    },
    {
      h: 'Run Unlock PDF',
      x: 'Click **Run Unlock PDF**. The file is sent over HTTPS to our server, where qpdf checks the password, removes the encryption and all restrictions, and returns the result. A wrong password is reported straight away.',
    },
    {
      h: 'Download the unlocked PDF',
      x: 'The copy downloads automatically and the upload is deleted at once. Pages, bookmarks, links and form fields are unchanged; only the encryption is gone.',
    },
  ],
  faqs: [
    {
      q: 'Can you unlock a PDF without the password?',
      a: 'Only when the file has an owner password alone, meaning it opens without asking but blocks printing or copying. Those restrictions are removed with the field left blank. If the PDF requires a password to open, that password is needed; AES encryption cannot be bypassed, and we do not attempt to guess it.',
    },
    {
      q: 'Is it legal to unlock a PDF?',
      a: 'Removing a password from a document you own or are authorised to open, for your own convenience, is normal use. Circumventing protection on someone else\'s document, or to get around a licence, may break the law where you live. Unlock PDF is for files you have the right to open.',
    },
    {
      q: 'What happens if I enter the wrong password?',
      a: 'The server checks the password with qpdf before doing anything else and returns a clear error saying it did not open the file. Nothing is converted, nothing is kept, and the attempt does not count against your monthly quota.',
    },
    {
      q: 'Does unlocking change the content of the PDF?',
      a: 'No. Text, images, fonts, bookmarks, links, annotations and form fields are copied through unchanged. The only difference is that the encryption dictionary and permission flags are gone, so the file opens directly and every viewer allows printing and copying.',
    },
    {
      q: 'Is my PDF and password stored?',
      a: 'No. The file is uploaded over HTTPS, decrypted in an isolated container and deleted the moment the unlocked copy is returned. The password is read into memory, handed to qpdf without touching a command line or a log, and discarded. Free for 5 files a month, Pro 300, API 5,000, see [pricing](/pricing).',
    },
  ],
  entities: ['PDF', 'qpdf', 'AES-256', 'owner password', 'user password', 'Adobe Acrobat', 'ISO 32000'],
  keywords: [
    'unlock pdf',
    'remove password from pdf',
    'unlock pdf online',
    'remove pdf print restriction',
    'decrypt pdf',
    'unlock pdf without password',
  ],
  metaTitle: 'Unlock PDF: Remove a Password and Restrictions Online',
  metaDescription:
    'Unlock a PDF on our server with qpdf. Remove the open password or lift print and copy restrictions from a file you own, and it is deleted after download.',
}

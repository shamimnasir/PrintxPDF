import type { ToolContent } from './types'

export const protectPdf: ToolContent = {
  slug: 'protect-pdf',
  answer:
    'Password protect a PDF by dropping it into Protect PDF, typing a password twice, choosing whether printing and copying stay allowed, and clicking Run. Our server encrypts it with AES-256 using qpdf, returns the locked file and deletes your upload immediately. Nobody can recover a forgotten password.',
  whatHeading: 'What is PDF encryption?',
  what: [
    {
      term: 'What is a password-protected PDF?',
      definition:
        'A protected PDF has its page contents, images and metadata streams encrypted inside the file, with a key derived from a password. PDF distinguishes two passwords: the user password, which a reader must type to open the document at all, and the owner password, which unlocks the permission flags. Protect PDF sets both to the password you enter, so the file asks for it on opening and the restrictions cannot be lifted without it.',
    },
    {
      term: 'What is AES-256 encryption in a PDF?',
      definition:
        'PDF encryption has gone through several revisions. Early files used 40-bit and 128-bit RC4, long since broken. Revision 4 introduced 128-bit AES, and revision 6 (PDF 2.0, ISO 32000-2) uses AES-256 with a SHA-256 based key derivation that makes brute-forcing a decent password impractical. Protect PDF always writes revision 6 AES-256, the strongest scheme the format offers, and every current reader from Adobe Acrobat to Preview, Chrome and Edge opens it.',
    },
    {
      term: 'What are PDF permissions?',
      definition:
        'Alongside the password, a PDF carries permission flags that tell a reader whether printing, copying text, editing, form filling and annotation are allowed once the file is open. Well-behaved viewers honour them. Protect PDF lets you allow everything, block printing, block copying, or block both, while text extraction for accessibility (screen readers) is always left enabled so the document stays usable by everyone who is allowed to open it.',
    },
  ],
  whyHeading: 'Why password protect a PDF?',
  why: [
    {
      h: 'Send confidential documents with confidence',
      x: 'Contracts, payslips, medical letters and financial statements travel through mail servers and shared inboxes. With AES-256 the file is unreadable to anyone without the password, wherever it ends up.',
    },
    {
      h: 'Meet a policy or a client requirement',
      x: 'Many firms require personal data to be encrypted in transit and at rest. A protected PDF satisfies that even when the document is sent as an ordinary attachment.',
    },
    {
      h: 'Limit printing and copying',
      x: 'Share a draft, a price list or a manuscript for reading only. Blocking print and copy makes casual redistribution harder without stopping the recipient from reading.',
    },
    {
      h: 'Real encryption, not a viewer trick',
      x: 'The protection is written into the file itself using qpdf, the reference open-source PDF library, so it holds in every reader and does not depend on our site.',
    },
    {
      h: 'Deleted the moment it is returned',
      x: 'Browsers cannot write PDF encryption, so the file goes over HTTPS to an isolated container, is encrypted and is removed as soon as the result is sent back. The password is passed to qpdf in memory and never logged.',
    },
  ],
  howHeading: 'How to password protect a PDF, step by step',
  how: [
    {
      h: 'Open Protect PDF and drop your PDF',
      x: 'Drag the file onto the drop zone or click to browse. One file at a time, up to 100 MB. A PDF that is already encrypted is refused rather than double-locked; unlock it first.',
    },
    {
      h: 'Type the password twice',
      x: 'Enter a **Password** of at least 4 characters and repeat it in **Confirm password**. Longer is stronger: a phrase of four or five words resists brute force far better than eight random characters. Keep a copy; nobody can recover it.',
    },
    {
      h: 'Choose what stays allowed once open',
      x: 'Under **Once open, allow**, pick **Everything**, **No printing**, **No copying text** or **No printing or copying**.',
    },
    {
      h: 'Run Protect PDF',
      x: 'Click **Run Protect PDF**. The file is sent over HTTPS to our server, qpdf encrypts it with AES-256 (revision 6) and the locked PDF downloads automatically. The upload is deleted at once.',
    },
    {
      h: 'Share the password separately',
      x: 'Send the password by a different channel from the file, for example by phone or a message rather than the same email. That is what makes the encryption count.',
    },
  ],
  faqs: [
    {
      q: 'How secure is the password protection?',
      a: 'The file is encrypted with AES-256 under PDF revision 6, the strongest scheme in the PDF standard, and there is no back door. The weak point is the password: a short or common one can be guessed by automated tools, while a long passphrase cannot be broken in any practical time.',
    },
    {
      q: 'What if I forget the password?',
      a: 'The document cannot be opened, by you or by us. We do not store passwords or files, and AES-256 has no recovery route. Keep the password in a password manager, and keep an unprotected copy somewhere safe.',
    },
    {
      q: 'Will the protected PDF open in Acrobat, Preview and browsers?',
      a: 'Yes. AES-256 revision 6 has been part of the standard since PDF 2.0 and is supported by Adobe Acrobat and Reader, macOS Preview, Chrome, Edge, Firefox, Safari and every mainstream viewer released in the last decade. Each will ask for the password on opening.',
    },
    {
      q: 'Can someone bypass the "no printing" or "no copying" restriction?',
      a: 'The restrictions are enforced by the reader, so a determined person with the open password could use a tool that ignores the flags. They stop casual copying and printing, not a motivated attacker. The open password is the real protection; permissions are a courtesy request that mainstream viewers honour.',
    },
    {
      q: 'Is my document uploaded, and is the password stored?',
      a: 'The PDF is uploaded over HTTPS, because browsers cannot write PDF encryption, and it is deleted the moment the protected copy is returned. The password is held in memory only, passed to qpdf without touching a command line or a log, and discarded. Free for 5 files a month, Pro 300, API 5,000.',
    },
  ],
  entities: ['PDF', 'AES-256', 'qpdf', 'ISO 32000-2', 'Adobe Acrobat', 'PDF 2.0', 'password'],
  keywords: [
    'password protect pdf',
    'protect pdf with password',
    'encrypt pdf',
    'lock pdf online',
    'pdf password protection aes-256',
    'restrict pdf printing and copying',
  ],
  metaTitle: 'Password Protect PDF: Encrypt with AES-256 Online',
  metaDescription:
    'Password protect a PDF on our server with AES-256 qpdf encryption. Set the password, restrict printing or copying, and your file is deleted after download.',
}

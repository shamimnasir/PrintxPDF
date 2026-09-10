import type { ToolContent } from './types'

export const extractZip: ToolContent = {
  slug: 'extract-zip',
  answer:
    'Extract ZIP opens a .zip file in your browser. Drop the archive, see every file inside with its size, and download one file or all of them together. Nothing is uploaded, each file is checked for damage as it is unpacked, and there is nothing to install.',
  whatHeading: 'What is a ZIP file?',
  what: [
    {
      term: 'ZIP: many files packed into one',
      definition:
        'A ZIP is a single file that holds other files and folders, usually squeezed to take up less space. Every computer and phone has been able to open one since the 1990s, which is why downloads and email attachments so often arrive as .zip. Each file inside keeps its name, its date and a small check number, so the unpacker can tell whether the file came out exactly as it went in.',
    },
    {
      term: 'Password-protected ZIP',
      definition:
        'Some ZIP files are locked with a password. The file names usually still show, but the contents are scrambled until the right password is given. A web browser has no built-in way to unscramble them, so Extract ZIP lists locked files but cannot unpack them. The older kind of ZIP locking is also weak enough that you should not rely on it to protect anything important.',
    },
  ],
  whyHeading: 'Why extract a ZIP in the browser?',
  why: [
    {
      h: 'Look inside before you commit',
      x: 'See the file list, folder layout and sizes first, then pull out only the one document you need instead of unpacking a hundred files onto your desktop.',
    },
    {
      h: 'Works where you cannot install anything',
      x: 'A locked-down work laptop, a school Chromebook or a phone often has no proper unzip tool. A browser tab is enough here.',
    },
    {
      h: 'The archive is never uploaded',
      x: 'Reading, unpacking and checking all happen on your own computer. A ZIP of client files or personal records never leaves it.',
    },
    {
      h: 'Safe by default',
      x: 'Every unpacked file is checked against the number stored in the archive, so a damaged file is caught. File names that try to point outside their own folder are renamed, so a nasty archive cannot put files where they do not belong.',
    },
  ],
  howHeading: 'How to extract a ZIP file, step by step',
  how: [
    {
      h: 'Open Extract ZIP and drop the archive',
      x: 'Drag one .zip file onto the drop zone or click to browse. The list of contents is read straight away and shown.',
    },
    {
      h: 'Review the contents',
      x: 'Folders and files are shown with their sizes. Files that are locked with a password, use the very large ZIP64 form of the format, or were packed with an unusual method are marked and will be skipped.',
    },
    {
      h: 'Download a single file',
      x: 'Click **Download** next to any file. It is unpacked in your browser, checked for damage and saved.',
    },
    {
      h: 'Or download everything',
      x: 'Click **Download all**. One file downloads as itself; several are packed into a new ZIP with the folder layout intact, so you get a single clean download.',
    },
  ],
  faqs: [
    {
      q: 'Can I open a password-protected ZIP?',
      a: 'No. Locked files are listed by name but cannot be unpacked, because the browser has no way to unscramble password-protected data. Open the archive with the password in the unzip tool built into Windows or macOS instead.',
    },
    {
      q: 'Is the ZIP uploaded to a server?',
      a: 'No. The archive is read from your disk into the browser tab, the files are unpacked using a feature built into the browser itself, and the downloads are made on your computer. Nothing is sent anywhere.',
    },
    {
      q: 'What size of archive can it handle?',
      a: 'Standard ZIP archives, which by definition are under 4 GB and hold fewer than 65,535 files. The extended ZIP64 form for bigger archives and archives split into several parts are refused. The archive is held in your browser\'s memory, so very large files depend on how much free memory your tab has.',
    },
    {
      q: 'Why does it say a file cannot be extracted?',
      a: 'The file is locked with a password, uses the ZIP64 extension for very large archives, or was packed with a method other than the two common ones (called store and deflate). The tool supports those two, which cover almost every archive you will meet, and skips the rest rather than give you a broken file.',
    },
    {
      q: 'Does it work on Safari and older browsers?',
      a: 'Unpacking squeezed files needs a feature that is built into current Chrome, Edge, Firefox and Safari 16.4 or later. On an older browser, files that were stored without squeezing still come out, and squeezed ones are marked as unavailable.',
    },
  ],
  entities: ['ZIP', 'ZIP archive', 'ZIP64', 'Password-protected ZIP', 'Chromebook'],
  keywords: [
    'extract zip file',
    'unzip online',
    'open zip file in browser',
    'unzip files without software',
    'view zip contents online',
    'extract zip on chromebook',
  ],
  metaTitle: 'Extract ZIP Online: Unzip Files in Your Browser, No Upload',
  metaDescription:
    'Extract a ZIP in your browser with no upload and nothing to install. See every file inside, download one or all, and each file is checked as it unpacks.',
}

import type { ToolContent } from './types'

export const extractZip: ToolContent = {
  slug: 'extract-zip',
  answer:
    'Extract a ZIP file by dropping it into Extract ZIP. The archive is read in your browser, every entry is listed with its size, and you can download one file or all of them together. Nothing is uploaded, each file is checked against its CRC-32, and no software is installed.',
  whatHeading: 'What is a ZIP file?',
  what: [
    {
      term: 'What is a ZIP file?',
      definition:
        'ZIP is the archive format from PKWARE that every operating system has opened since the 1990s. A .zip holds files and folders as entries, each with a name, a timestamp, a compression method and a CRC-32 checksum, followed by a central directory that indexes them all. Most entries are compressed with DEFLATE; already-compressed files such as photos are often just stored. The ZIP64 extension lifts the original 4 GB and 65,535-entry limits.',
    },
    {
      term: 'What is an encrypted ZIP?',
      definition:
        'A password-protected ZIP marks each protected entry with an encryption flag and scrambles its data with either the old ZipCrypto scheme or AES (the WinZip extension). The file names usually stay visible; the contents do not. Browsers have no built-in way to decrypt these, and the legacy ZipCrypto scheme is weak enough that it should not be relied on. Extract ZIP lists encrypted entries but cannot unpack them.',
    },
  ],
  whyHeading: 'Why extract a ZIP in the browser?',
  why: [
    {
      h: 'Look inside before you commit',
      x: 'See the file list, folder structure and sizes first, then pull out only the one document you need instead of unpacking a hundred files onto your desktop.',
    },
    {
      h: 'Works where you cannot install anything',
      x: 'A locked-down work laptop, a school Chromebook or a phone often has no proper archive tool. A browser tab is enough here.',
    },
    {
      h: 'The archive is never uploaded',
      x: 'Reading, inflating and checksum verification all run locally. A ZIP of client files or personal records never leaves your computer.',
    },
    {
      h: 'Safe by default',
      x: 'Every extracted file is verified against its CRC-32, and paths containing `../` are renamed so a hostile archive cannot write outside its own folder.',
    },
  ],
  howHeading: 'How to extract a ZIP file, step by step',
  how: [
    {
      h: 'Open Extract ZIP and drop the archive',
      x: 'Drag one .zip file onto the drop zone or click to browse. The central directory is read immediately and the contents appear as a list.',
    },
    {
      h: 'Review the contents',
      x: 'Folders and files are shown with their sizes. Entries that are encrypted, ZIP64 or use an unusual compression method are marked and will be skipped.',
    },
    {
      h: 'Download a single file',
      x: 'Click **Download** next to any entry. It is inflated in your browser, checked against its CRC-32 and saved.',
    },
    {
      h: 'Or download everything',
      x: 'Click **Download all**. One file downloads as itself; several are re-packed into a new ZIP with the folder structure intact, so you get a single clean download.',
    },
  ],
  faqs: [
    {
      q: 'Can I open a password-protected ZIP?',
      a: 'No. Encrypted entries are listed by name but cannot be extracted, because the browser has no way to decrypt ZipCrypto or AES-protected data. Open the archive with the password in your operating system\'s built-in unzip tool instead.',
    },
    {
      q: 'Is the ZIP uploaded to a server?',
      a: 'No. The archive is read from your disk into the browser tab, entries are inflated with the browser\'s own DecompressionStream, and downloads are created locally. Nothing is transmitted.',
    },
    {
      q: 'What size of archive can it handle?',
      a: 'Standard ZIP archives, which by definition are under 4 GB with fewer than 65,535 entries; ZIP64 and multi-part archives are refused. In practice the archive is held in the browser\'s memory, so very large files depend on how much free RAM your tab has.',
    },
    {
      q: 'Why does it say an entry cannot be extracted?',
      a: 'The entry is encrypted, uses ZIP64 fields, or was compressed with a method other than store or DEFLATE (for example BZIP2 or LZMA). The tool supports the two methods that cover almost every archive in circulation and skips the rest rather than producing broken files.',
    },
    {
      q: 'Does it work on Safari and older browsers?',
      a: 'Inflating DEFLATE entries needs DecompressionStream, which is in current Chrome, Edge, Firefox and Safari 16.4 or later. On an older browser, stored entries still extract and compressed ones are marked as unavailable.',
    },
  ],
  entities: ['ZIP', 'DEFLATE', 'CRC-32', 'ZIP64', 'PKWARE', 'DecompressionStream'],
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
    'Extract a ZIP in your browser with no upload and nothing to install. See every file inside, download one or all, with CRC-32 checks on each entry you unpack.',
}

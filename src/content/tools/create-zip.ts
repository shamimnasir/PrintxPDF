import type { ToolContent } from './types'

export const createZip: ToolContent = {
  slug: 'create-zip',
  answer:
    'Create a ZIP file by dropping any files or a whole folder into Create ZIP, naming the archive and clicking Create ZIP. The archive is assembled in your browser, so nothing is uploaded, folder paths are kept, and archives up to 1 GB download in seconds.',
  whatHeading: 'What is a ZIP file?',
  what: [
    {
      term: 'What is a ZIP file?',
      definition:
        'ZIP is the archive format introduced by PKWARE in 1989 and now built into Windows, macOS, Linux, iOS and Android. One .zip file holds any number of files and folders, each stored as an entry with its name, timestamp and a CRC-32 checksum, followed by a central directory that lists everything. Entries can be compressed with DEFLATE or simply stored uncompressed, and every unzip tool understands both.',
    },
    {
      term: 'What does "stored" mean in a ZIP?',
      definition:
        'A stored entry is written into the archive byte for byte, with no compression applied, while DEFLATE entries are squeezed first. Photos, videos, PDFs, Office documents and existing archives are already compressed internally, so DEFLATE gains almost nothing on them and costs time and memory. Create ZIP writes every entry as stored, which keeps it fast and predictable in a browser, and produces a standard archive that opens everywhere.',
    },
  ],
  whyHeading: 'Why create a ZIP file?',
  why: [
    {
      h: 'Send many files as one attachment',
      x: 'Email, chat and upload forms deal with a single file far better than with forty. A ZIP keeps the folder structure and arrives as one download.',
    },
    {
      h: 'No software to install',
      x: 'Windows and macOS can zip a folder, but a locked-down work laptop, a Chromebook or a phone often cannot. This tool works in the browser tab you already have open.',
    },
    {
      h: 'Your files never leave your computer',
      x: 'The archive is built in memory in your browser. Contracts, photos and source code are never uploaded, and it works offline once the page has loaded.',
    },
    {
      h: 'Keep folders and names intact',
      x: 'Drop a folder and the paths inside it are written into the archive as they are. Duplicate names are renamed automatically instead of overwriting each other.',
    },
  ],
  howHeading: 'How to create a ZIP file, step by step',
  how: [
    {
      h: 'Open Create ZIP and drop your files',
      x: 'Drag any files onto the drop zone, or use the folder button to add a whole directory with its subfolders. Any file type is accepted.',
    },
    {
      h: 'Check the list',
      x: 'The files and their paths appear with sizes and a running total. Remove anything you do not want with the cross next to it. Over 500 MB you get a warning; the cap is 1 GB.',
    },
    {
      h: 'Name the archive',
      x: 'Type a **File name**; the `.zip` extension is added for you.',
    },
    {
      h: 'Click Create ZIP',
      x: 'Press **Create ZIP**. The archive is assembled in your browser in a few seconds and downloads automatically.',
    },
  ],
  faqs: [
    {
      q: 'Will the ZIP be smaller than the original files?',
      a: 'Usually not by much. Create ZIP stores files without recompressing them, because most of what people zip (photos, videos, PDFs, Office files) is already compressed and would not shrink. You get one tidy archive of about the same total size, which is what attachments and uploads need.',
    },
    {
      q: 'Is there a size limit?',
      a: 'Yes, 1 GB per archive, because the ZIP is built in the browser\'s memory. Above 500 MB you are warned that a tab with little free RAM may fail; splitting into two archives is safer. There is no limit on the number of files.',
    },
    {
      q: 'Are my files uploaded anywhere?',
      a: 'No. Everything happens inside your browser, and the page works offline once loaded. The only thing that leaves your machine is the finished ZIP, and only when you send it somewhere yourself.',
    },
    {
      q: 'Can I password-protect the ZIP?',
      a: 'Not with this tool; the archive is written without encryption so it opens on every device. To protect a PDF before you zip it, use [Protect PDF](/tools/protect-pdf), which encrypts the document itself with AES-256.',
    },
    {
      q: 'Will the archive open on Windows, macOS and phones?',
      a: 'Yes. It is a standard ZIP with stored entries and CRC-32 checksums, readable by Windows Explorer, macOS Finder, iOS and Android without extra apps, as well as by every archive utility.',
    },
  ],
  entities: ['ZIP', 'DEFLATE', 'CRC-32', 'PKWARE', 'Windows Explorer', 'macOS Finder'],
  keywords: [
    'create zip file',
    'zip files online',
    'make a zip file in browser',
    'compress files to zip',
    'zip a folder online',
    'create zip without software',
  ],
  metaTitle: 'Create ZIP Online: Zip Files and Folders in Your Browser',
  metaDescription:
    'Create a ZIP file in your browser with no upload and no software. Drop files or a folder, name the archive and download up to 1 GB with folder paths kept.',
}

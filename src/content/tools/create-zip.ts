import type { ToolContent } from './types'

export const createZip: ToolContent = {
  slug: 'create-zip',
  answer:
    'Create ZIP packs any files or a whole folder into one ZIP file. Drop them in, give the ZIP a name and click Create ZIP. It is built in your browser, so nothing is uploaded, your folder layout is kept, and ZIP files up to 1 GB download in seconds.',
  whatHeading: 'What is a ZIP file?',
  what: [
    {
      term: 'What is a ZIP file?',
      definition:
        'A ZIP file is a container that holds many files and folders inside one file, a bit like a box you can post. Windows, Mac, Linux, iPhone and Android can all open one without extra software. Each file inside keeps its name, its date and a small check number that proves it arrived intact. Files inside can be squeezed to save space or simply stored as they are, and every unzip tool understands both.',
    },
    {
      term: 'Why does this tool store files instead of squeezing them?',
      definition:
        'Squeezing a file only helps when there is loose space to squeeze out. Photos, videos, PDFs, Word and Excel files and other ZIPs are already packed tight on the inside, so squeezing them again gains almost nothing and costs time and memory. Create ZIP stores every file as it is, which keeps it fast and reliable in a browser, and gives you a normal ZIP that opens everywhere.',
    },
  ],
  whyHeading: 'Why create a ZIP file?',
  why: [
    {
      h: 'Send many files as one attachment',
      x: 'Email, chat and upload forms deal with a single file far better than with forty. A ZIP keeps your folders in place and arrives as one download.',
    },
    {
      h: 'No software to install',
      x: 'Windows and Mac can zip a folder, but a locked-down work laptop, a Chromebook or a phone often cannot. This tool works in the browser tab you already have open.',
    },
    {
      h: 'Your files never leave your computer',
      x: 'The ZIP is built in your browser. Contracts, photos and work files are never uploaded, and it works offline once the page has loaded.',
    },
    {
      h: 'Keep folders and names intact',
      x: 'Drop a folder and the folder layout inside it is kept exactly as it is. Files with the same name are renamed automatically instead of overwriting each other.',
    },
  ],
  howHeading: 'How to create a ZIP file, step by step',
  how: [
    {
      h: 'Open Create ZIP and drop your files',
      x: 'Drag any files onto the drop zone, or use the folder button to add a whole folder with everything inside it. Any file type is accepted.',
    },
    {
      h: 'Check the list',
      x: 'The files and their folder paths appear with sizes and a running total. Remove anything you do not want with the cross next to it. Over 500 MB you get a warning; the limit is 1 GB.',
    },
    {
      h: 'Name the ZIP',
      x: 'Type a **File name**; the `.zip` ending is added for you.',
    },
    {
      h: 'Click Create ZIP',
      x: 'Press **Create ZIP**. The file is put together in your browser in a few seconds and downloads automatically.',
    },
  ],
  faqs: [
    {
      q: 'Will the ZIP be smaller than the original files?',
      a: 'Usually not by much. Create ZIP stores files without squeezing them, because most of what people zip (photos, videos, PDFs, Office files) is already packed tight and would not shrink. You get one tidy file of about the same total size, which is what attachments and uploads need.',
    },
    {
      q: 'Is there a size limit?',
      a: 'Yes, 1 GB per ZIP, because it is built in your browser\'s memory. Above 500 MB you are warned that a browser with little free memory may fail; splitting into two ZIPs is safer. There is no limit on the number of files.',
    },
    {
      q: 'Are my files uploaded anywhere?',
      a: 'No. Everything happens inside your browser, and the page works offline once loaded. The only thing that leaves your computer is the finished ZIP, and only when you send it somewhere yourself.',
    },
    {
      q: 'Can I put a password on the ZIP?',
      a: 'Not with this tool; the ZIP is written without a password so it opens on every device. To protect a PDF before you zip it, use [Protect PDF](/tools/protect-pdf), which locks the document itself with strong encryption.',
    },
    {
      q: 'Will the ZIP open on Windows, Mac and phones?',
      a: 'Yes. It is a normal ZIP file that Windows, Mac, iPhone and Android open without extra apps, and every unzip program can read it too.',
    },
  ],
  entities: ['ZIP file', 'File archive', 'Folder', 'Email attachment', 'Windows', 'macOS'],
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
    'Create a ZIP file in your browser with no upload and no software. Drop files or a folder, name the ZIP and download up to 1 GB with your folder layout kept.',
}

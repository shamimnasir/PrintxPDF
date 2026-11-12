import type { ToolContent } from './types'

export const removeAiMetadata: ToolContent = {
  slug: 'remove-ai-metadata',
  answer: 'AI Metadata Remover creates a new PNG, JPG or WebP from the visible pixels of your image. That drops common EXIF, IPTC and XMP fields, plus embedded C2PA or Content Credentials provenance records, without uploading the file.',
  whatHeading: 'What image metadata can an AI image carry?',
  what: [
    { term: 'EXIF: camera, time and location details', definition: 'EXIF is a set of hidden fields often added by phones and cameras. It can include the device model, capture time, rotation and GPS location.' },
    { term: 'IPTC and XMP: descriptions and workflow details', definition: 'IPTC and XMP are metadata formats used by editors, asset libraries and publishing tools. They can hold titles, authors, keywords, edit history and software details.' },
    { term: 'C2PA and Content Credentials: provenance records', definition: 'Some image tools attach a provenance record, often called Content Credentials, to record how an image was made or edited. This tool removes embedded records by creating a fresh image file.' },
  ],
  whyHeading: 'Why make a metadata-free copy?',
  why: [
    { h: 'Share only the pixels', x: 'A fresh copy is useful when you want to send the visible picture without its camera details, author fields, software notes or embedded provenance record.' },
    { h: 'Keep the original intact', x: 'The source file is never changed. Downloaded copies have a new filename, so you can retain the original for your own records.' },
    { h: 'Keep sensitive files local', x: 'Reading and re-saving happens inside your browser. The image is not sent to PrintxPDF or another server.' },
  ],
  howHeading: 'How to remove AI metadata from an image',
  how: [
    { h: 'Open AI Metadata Remover and add images', x: 'Drop PNG, JPG, WebP or HEIC images into the page. You can add several files at once.' },
    { h: 'Choose PNG, JPG or WebP', x: 'Keep PNG or WebP for transparent images. Choose JPG for ordinary photos when a broadly compatible file is more useful.' },
    { h: 'Create and download the clean copy', x: 'Click Remove metadata. The browser decodes the visible pixels and saves them into a fresh file, leaving common metadata blocks behind.' },
  ],
  faqs: [
    { q: 'Does this remove ChatGPT, Claude or Gemini metadata?', a: 'It removes embedded metadata that survives browser decoding, including common EXIF, IPTC, XMP and C2PA or Content Credentials records. Providers vary, so it cannot promise to remove a label that is visible in the pixels or metadata stored outside the image file.' },
    { q: 'Will it remove a visible watermark or AI label?', a: 'No. This tool only makes a metadata-free file. It does not alter visible pixels, so it does not remove watermarks, text or labels baked into the image.' },
    { q: 'Are my images uploaded?', a: 'No. The image is decoded and saved again in your browser. Nothing is sent to a server.' },
    { q: 'Does it keep image quality?', a: 'PNG output keeps the decoded pixels exactly. JPG and WebP are compressed formats, so they can make subtle quality trade-offs. Choose PNG when retaining every decoded pixel matters most.' },
  ],
  entities: ['EXIF', 'IPTC', 'XMP', 'C2PA', 'Content Credentials', 'AI-generated images'],
  keywords: ['remove ai metadata', 'remove chatgpt image metadata', 'remove c2pa metadata', 'remove content credentials', 'strip image metadata', 'remove exif online'],
  metaTitle: 'AI Metadata Remover: Strip C2PA, EXIF and XMP Locally',
  metaDescription: 'Create a metadata-free image copy in your browser. Remove common EXIF, IPTC, XMP and C2PA provenance records with no upload.',
}

const LEGACY_COVERS: Record<string, string> = {
  'how-to-edit-a-pdf': 'document-guide-cover.jpg',
  'print-web-page-without-ads': 'web-to-print-cover.jpg',
  'convert-an-image-format': 'file-conversion-cover.jpg',
  'how-to-ocr-a-scanned-pdf': 'scan-ocr-cover.jpg',
  'remove-metadata-from-pdf': 'document-privacy-cover.jpg',
  'qr-code-for-print': 'qr-print-cover.jpg',
  'compress-pdf': 'compress-pdf.jpg',
  'merge-pdf': 'merge-pdf.jpg',
}

const coverPath = (topic: string) => LEGACY_COVERS[topic] || `${topic}.jpg`

export const guideCoverUrl = (topic: string) => `${import.meta.env.BASE_URL}images/guides/${coverPath(topic)}`
export const guideCoverAlt = (_locale = 'en', topic = '', title = '') => title || topic

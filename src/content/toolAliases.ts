import type { OutFormat } from '../features/files/engines'

export type ToolAlias = {
  slug: string
  baseSlug: 'image-converter'
  source: string
  target: OutFormat
  name: string
  metaTitle: string
  metaDescription: string
  answer: string
  keywords: string[]
}

/** Search-intent landing pages for real image-conversion paths supported by Image Converter. */
export const TOOL_ALIASES: ToolAlias[] = [
  {
    slug: 'heic-to-jpg',
    baseSlug: 'image-converter',
    source: 'HEIC',
    target: 'jpg',
    name: 'HEIC to JPG Converter',
    metaTitle: 'HEIC to JPG Converter, Free and Private Online',
    metaDescription: 'Convert HEIC and HEIF photos to JPG in your browser. No upload, no sign-up, batch conversion, correct rotation, and a ZIP download.',
    answer: 'Convert iPhone HEIC or HEIF photos to JPG in your browser. PrintxPDF decodes the image, respects its rotation, and downloads JPG files without uploading your photos or requiring an account.',
    keywords: ['heic to jpg', 'heic to jpg converter', 'convert heic to jpeg', 'heif to jpg', 'iphone photo to jpg', 'heic to jpg windows'],
  },
  {
    slug: 'heic-to-png',
    baseSlug: 'image-converter',
    source: 'HEIC',
    target: 'png',
    name: 'HEIC to PNG Converter',
    metaTitle: 'HEIC to PNG Converter, Free in Your Browser',
    metaDescription: 'Convert HEIC and HEIF photos to PNG locally in your browser. Keep exact pixels, fix rotation, batch files, and download without uploading photos.',
    answer: 'Turn HEIC or HEIF photos from an iPhone into PNG files in your browser. PNG keeps every pixel, and the conversion stays on your device with no upload or account.',
    keywords: ['heic to png', 'heic to png converter', 'heif to png', 'convert iphone photo to png', 'heic png online'],
  },
  {
    slug: 'heic-to-webp',
    baseSlug: 'image-converter',
    source: 'HEIC',
    target: 'webp',
    name: 'HEIC to WebP Converter',
    metaTitle: 'HEIC to WebP Converter, Free and No Upload',
    metaDescription: 'Convert HEIC and HEIF photos to WebP in your browser. Make smaller web images, keep rotation correct, and process batches privately.',
    answer: 'Convert iPhone HEIC photos to smaller WebP images for websites and apps. PrintxPDF processes them in your browser, lets you choose quality, and never uploads the originals.',
    keywords: ['heic to webp', 'heic to webp converter', 'heif to webp', 'iphone photo webp', 'convert heic for website'],
  },
  {
    slug: 'png-to-jpg',
    baseSlug: 'image-converter',
    source: 'PNG',
    target: 'jpg',
    name: 'PNG to JPG Converter',
    metaTitle: 'PNG to JPG Converter, Free Online and Private',
    metaDescription: 'Convert PNG images to JPG in your browser. Choose quality, turn transparency white, batch files, and download without uploading anything.',
    answer: 'Convert PNG screenshots, graphics, and photos to JPG with a quality setting in your browser. Transparent areas become white because JPG cannot store transparency, and your files stay on your device.',
    keywords: ['png to jpg', 'png to jpg converter', 'convert png to jpeg', 'png to jpg online', 'png image converter'],
  },
  {
    slug: 'jpg-to-png',
    baseSlug: 'image-converter',
    source: 'JPG',
    target: 'png',
    name: 'JPG to PNG Converter',
    metaTitle: 'JPG to PNG Converter, Free in Your Browser',
    metaDescription: 'Convert JPG and JPEG images to PNG in your browser. Process batches locally, keep exact output pixels, and download without an upload.',
    answer: 'Convert JPG or JPEG photos into PNG files in your browser. PNG is useful for screenshots, graphics, and editing workflows, and PrintxPDF keeps the conversion local to your device.',
    keywords: ['jpg to png', 'jpg to png converter', 'jpeg to png', 'convert jpg online', 'jpg png converter'],
  },
  {
    slug: 'webp-to-jpg',
    baseSlug: 'image-converter',
    source: 'WebP',
    target: 'jpg',
    name: 'WebP to JPG Converter',
    metaTitle: 'WebP to JPG Converter, Free and Private',
    metaDescription: 'Convert WebP images to JPG in your browser. Choose quality, batch files, and download compatible JPGs without uploading your images.',
    answer: 'Convert WebP images into widely compatible JPG files for forms, email, printing, and older apps. Choose quality and process the images locally in your browser.',
    keywords: ['webp to jpg', 'webp to jpg converter', 'convert webp to jpeg', 'webp jpg online', 'webp image converter'],
  },
  {
    slug: 'webp-to-png',
    baseSlug: 'image-converter',
    source: 'WebP',
    target: 'png',
    name: 'WebP to PNG Converter',
    metaTitle: 'WebP to PNG Converter, Free Online',
    metaDescription: 'Convert WebP images to PNG in your browser. Keep transparency, process batches, and download without uploading your files.',
    answer: 'Convert WebP graphics and images to PNG when you need broad editing support or a lossless file. The conversion runs in your browser and can keep transparency.',
    keywords: ['webp to png', 'webp to png converter', 'convert webp image to png', 'webp png online', 'webp transparency'],
  },
  {
    slug: 'svg-to-png',
    baseSlug: 'image-converter',
    source: 'SVG',
    target: 'png',
    name: 'SVG to PNG Converter',
    metaTitle: 'SVG to PNG Converter, Free in Your Browser',
    metaDescription: 'Convert SVG logos and drawings to PNG at the size you choose. Keep transparency or add white, with no upload and no sign-up.',
    answer: 'Turn an SVG logo, icon, or drawing into a PNG at an exact width or scale. PrintxPDF rasterises it in your browser, so you control the pixels and your source file stays private.',
    keywords: ['svg to png', 'svg to png converter', 'convert svg to png', 'svg png online', 'svg logo to png'],
  },
  {
    slug: 'svg-to-jpg',
    baseSlug: 'image-converter',
    source: 'SVG',
    target: 'jpg',
    name: 'SVG to JPG Converter',
    metaTitle: 'SVG to JPG Converter, Free and Simple',
    metaDescription: 'Convert SVG logos and drawings to JPG in your browser. Choose the size and quality, with transparent areas rendered white.',
    answer: 'Convert an SVG logo or drawing into a JPG for forms, email, or apps that do not accept vector files. Choose the output size and quality, and transparent areas become white.',
    keywords: ['svg to jpg', 'svg to jpg converter', 'convert svg to jpeg', 'svg jpg online', 'svg logo to jpg'],
  },
]

const ALIASES = new Map(TOOL_ALIASES.map((alias) => [alias.slug, alias]))
export const toolAliasBySlug = (slug: string) => ALIASES.get(slug)


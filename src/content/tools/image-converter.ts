import type { ToolContent } from './types'

export const imageConverter: ToolContent = {
  slug: 'image-converter',
  answer:
    'Convert HEIC to JPG, or any PNG, JPG, WebP, GIF, BMP or SVG to PNG, JPG or WebP, by dropping the images into Image Converter, choosing the output format and clicking Convert. Everything runs in your browser, photos are never uploaded, and the batch downloads as files or one ZIP.',
  whatHeading: 'What are HEIC, JPG, PNG, WebP and SVG?',
  what: [
    {
      term: 'What is a HEIC file?',
      definition:
        'HEIC is the file extension Apple uses for photos stored in the HEIF container (High Efficiency Image File Format, ISO 23008-12) with HEVC/H.265 compression. iPhones and iPads have shot HEIC by default since iOS 11 because it holds the same quality as JPG in roughly half the space, plus depth maps, live photo frames and 10-bit colour. The catch is compatibility: Windows, many web forms, older Android phones and most content systems still refuse it.',
    },
    {
      term: 'What is a JPG file?',
      definition:
        'JPG (JPEG, ISO 10918) is the universal photo format. It compresses an image by splitting it into 8 by 8 pixel blocks, applying a discrete cosine transform and discarding the fine detail the eye notices least, which is why it is lossy and why a quality setting exists. JPG has no transparency and no animation, but every camera, browser, printer, form upload and operating system since the 1990s opens it without question.',
    },
    {
      term: 'What is a PNG file?',
      definition:
        'PNG (Portable Network Graphics, ISO 15948) is a lossless format: every pixel is stored exactly, compressed with DEFLATE, so screenshots, logos, diagrams and text stay crisp no matter how many times they are saved. PNG supports full alpha transparency, which JPG cannot do. The price is size; a photo saved as PNG is often five to ten times larger than the same picture as a JPG.',
    },
    {
      term: 'What is a WebP file?',
      definition:
        'WebP is the image format Google designed for the web. It offers both lossy compression (typically 25 to 35 percent smaller than a JPG of similar quality) and lossless compression with transparency, in a single format. Chrome, Firefox, Safari 14 and later, Edge and Android all display it, which makes it a strong choice for website images, and a poor one for printing or for sending to anyone still on old software.',
    },
    {
      term: 'What is an SVG file?',
      definition:
        'SVG (Scalable Vector Graphics) is an XML text format that describes shapes, paths and text mathematically rather than as pixels, so a logo or icon stays sharp at any size. Browsers render SVG natively, but many apps, marketplaces and social networks want a bitmap. Converting an SVG to PNG rasterises it at a width you choose; converting to JPG also flattens the transparent background to white.',
    },
  ],
  whyHeading: 'Why convert HEIC to JPG, or between image formats?',
  why: [
    {
      h: 'Make iPhone photos open everywhere',
      x: 'A HEIC photo fails on Windows without extra codecs, on many upload forms and in older apps. The same picture as a JPG opens on every device you will ever meet.',
    },
    {
      h: 'Keep the photo, keep it private',
      x: 'Decoding happens in your browser with a WebAssembly build of libheif that loads only when a HEIC is present. Nothing is uploaded, so family photos, ID scans and client work stay on your machine.',
    },
    {
      h: 'Get transparency or lose it on purpose',
      x: 'Convert a JPG or SVG to PNG when you need a transparent background for a logo, or a PNG to JPG when a form insists on a photo format and transparency is not needed.',
    },
    {
      h: 'Shrink images for the web',
      x: 'WebP output at a quality you choose is usually a third smaller than JPG, which speeds up pages and reduces storage without a visible difference.',
    },
    {
      h: 'Convert a whole batch at once',
      x: 'Drop a folder of photos, pick one output format and one quality, and download the results together as a ZIP.',
    },
  ],
  howHeading: 'How to convert HEIC to JPG, step by step',
  how: [
    {
      h: 'Open Image Converter and drop your HEIC photos',
      x: 'Drag any mix of HEIC, HEIF, PNG, JPG, WebP, GIF, BMP or SVG files onto the drop zone. The first HEIC triggers a one-time download of the libheif decoder (about 2 MB) into your browser.',
    },
    {
      h: 'Choose the output format',
      x: 'Under **Convert to**, pick **JPG**, **PNG** or **WebP**. WebP is hidden if your browser cannot encode it.',
    },
    {
      h: 'Set the quality',
      x: 'For JPG and WebP, move the **Quality** slider between 40 and 100. PNG is lossless and has no quality setting. For SVG input, choose a scale or type an exact width in pixels, and tick **White background** if you do not want transparency.',
    },
    {
      h: 'Click Convert',
      x: 'Press **Convert to JPG** (or PNG or WebP). Each image is decoded, rotated upright using its EXIF orientation and re-encoded in your browser. The preview shows the new size next to the old one.',
    },
    {
      h: 'Download the results',
      x: 'Save the converted files one by one, or download the whole batch as a single ZIP.',
    },
  ],
  faqs: [
    {
      q: 'Is HEIC to JPG conversion lossless?',
      a: 'No. HEIC and JPG are both lossy formats, so the photo is decoded and then re-encoded, and a little detail is discarded at each step. At quality 90 or higher the difference is invisible in normal viewing, and the JPG will usually be larger than the HEIC. Choose PNG if you want no further loss.',
    },
    {
      q: 'Are my photos uploaded to a server?',
      a: 'No. Decoding, rotation and encoding all happen in your browser. The only network request is the one-time fetch of the libheif WebAssembly decoder when a HEIC is present, and that is code, not your image.',
    },
    {
      q: 'Why does my photo come out sideways or upside down elsewhere but not here?',
      a: 'Phones save the sensor image and record the rotation in EXIF metadata. Some apps ignore that tag. Image Converter reads the orientation and bakes the correct rotation into the pixels, so the output shows the right way up everywhere.',
    },
    {
      q: 'How do I convert HEIC to JPG on Windows?',
      a: 'Open this page in Edge, Chrome or Firefox, drop the HEIC files and click Convert. Nothing is installed and no codec pack is needed, because the decoder runs inside the browser tab. It works the same on macOS, Linux, ChromeOS and Android.',
    },
    {
      q: 'What happens to transparency when converting to JPG?',
      a: 'JPG cannot store transparency, so transparent areas in a PNG, WebP or SVG become white. Convert to PNG or WebP instead if you need to keep the transparent background.',
    },
  ],
  entities: ['HEIC', 'HEIF', 'HEVC', 'JPEG', 'PNG', 'WebP', 'SVG', 'libheif'],
  keywords: [
    'heic to jpg converter',
    'convert heic to jpg',
    'heic to jpg on windows',
    'heic to png',
    'png to jpg converter',
    'webp to png',
    'svg to png converter',
    'image converter online',
  ],
  metaTitle: 'HEIC to JPG Converter: HEIC, PNG, WebP, SVG in Your Browser',
  metaDescription:
    'Convert HEIC to JPG, PNG or WebP in your browser. Photos are never uploaded, EXIF orientation is honoured and batches download as one ZIP. Works on Windows.',
}

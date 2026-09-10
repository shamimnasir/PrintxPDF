import type { ToolContent } from './types'

export const imageConverter: ToolContent = {
  slug: 'image-converter',
  answer:
    'Image Converter turns HEIC (the photo format iPhones use) into JPG, or any PNG, JPG, WebP, GIF, BMP or SVG picture into PNG, JPG or WebP. Drop the images, pick a format, click Convert. Everything runs in your browser, photos are never uploaded, and a batch downloads as one ZIP.',
  whatHeading: 'What are HEIC, JPG, PNG, WebP and SVG?',
  what: [
    {
      term: 'HEIC: the photo format iPhones use',
      definition:
        'HEIC is the format iPhones and iPads have saved photos in since 2017. Apple chose it because a HEIC photo looks the same as a JPG at about half the size, and it can hold extras such as Live Photo frames. The catch is that many other things cannot open it: Windows without an add-on, lots of upload forms, older Android phones and most website systems. Converting to JPG solves that.',
    },
    {
      term: 'JPG: the photo format everything opens',
      definition:
        'JPG is the universal photo format. It makes files small by throwing away tiny details your eye does not notice, which is why there is a quality setting: higher quality keeps more detail and makes a bigger file. A JPG cannot have a see-through background, but every camera, phone, browser, printer, upload form and computer since the 1990s opens it without question.',
    },
    {
      term: 'PNG: exact pixels and see-through backgrounds',
      definition:
        'PNG stores every pixel exactly, with nothing thrown away, so screenshots, logos, diagrams and text stay crisp no matter how many times the file is saved. PNG can also have a see-through background, which JPG cannot. The price is size: a photo saved as PNG is often five to ten times larger than the same picture as a JPG.',
    },
    {
      term: 'WebP: smaller pictures for websites',
      definition:
        'WebP is a format Google designed for web pages. It makes files about a quarter to a third smaller than a JPG of the same quality, and it can also keep exact pixels and see-through backgrounds. Chrome, Firefox, Safari 14 and later, Edge and Android all show it, which makes it a good choice for website images, and a poor one for printing or for sending to anyone on old software.',
    },
    {
      term: 'SVG: a drawing made of shapes, not pixels',
      definition:
        'An SVG is a drawing described as shapes and lines rather than as a grid of pixels, so a logo or icon stays sharp at any size. Browsers show SVG directly, but many apps, marketplaces and social networks want a normal picture. Converting an SVG to PNG draws it as a picture at a width you choose; converting to JPG also fills the see-through background with white.',
    },
  ],
  whyHeading: 'Why convert HEIC to JPG, or between image formats?',
  why: [
    {
      h: 'Make iPhone photos open everywhere',
      x: 'A HEIC photo fails on Windows without an add-on, on many upload forms and in older apps. The same picture as a JPG opens on every device you will ever meet.',
    },
    {
      h: 'Keep the photo, keep it private',
      x: 'The photos are read and converted inside your browser. Nothing is uploaded, so family photos, ID scans and client work stay on your machine.',
    },
    {
      h: 'Get a see-through background, or lose it on purpose',
      x: 'Convert a JPG or SVG to PNG when you need a see-through background for a logo, or a PNG to JPG when a form insists on a photo format and a see-through background is not needed.',
    },
    {
      h: 'Shrink images for the web',
      x: 'WebP output at a quality you choose is usually a third smaller than JPG, which speeds up pages and saves storage without a visible difference.',
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
      x: 'Drag any mix of HEIC, HEIF, PNG, JPG, WebP, GIF, BMP or SVG files onto the drop zone. The first HEIC triggers a one-time download of a small helper (about 2 MB) into your browser so it can read the format.',
    },
    {
      h: 'Choose the output format',
      x: 'Under **Convert to**, pick **JPG**, **PNG** or **WebP**. WebP is hidden if your browser cannot save it.',
    },
    {
      h: 'Set the quality',
      x: 'For JPG and WebP, move the **Quality** slider between 40 and 100. PNG keeps every pixel and has no quality setting. For SVG input, choose a scale or type an exact width in pixels, and tick **White background** if you do not want a see-through one.',
    },
    {
      h: 'Click Convert',
      x: 'Press **Convert to JPG** (or PNG or WebP). Each image is read, turned the right way up using the rotation note your phone saved inside the photo, and saved again in your browser. The preview shows the new size next to the old one.',
    },
    {
      h: 'Download the results',
      x: 'Save the converted files one by one, or download the whole batch as a single ZIP.',
    },
  ],
  faqs: [
    {
      q: 'Does converting HEIC to JPG lose any quality?',
      a: 'A little. HEIC and JPG both save space by throwing away tiny details, so the photo is unpacked and then packed again, and a little detail goes at each step. At quality 90 or higher you will not see the difference, and the JPG will usually be larger than the HEIC. Choose PNG if you want no further loss at all.',
    },
    {
      q: 'Are my photos uploaded to a server?',
      a: 'No. Reading, rotating and saving all happen in your browser. The only thing fetched from the internet is the small one-time helper that lets the browser read HEIC, and that is program code, not your picture.',
    },
    {
      q: 'Why does my photo come out sideways or upside down elsewhere but not here?',
      a: 'Phones save the photo as the sensor saw it and add a note inside the file saying how it should be turned. Some apps ignore that note. Image Converter reads it and turns the actual pixels the right way up, so the result shows correctly everywhere.',
    },
    {
      q: 'How do I convert HEIC to JPG on Windows?',
      a: 'Open this page in Edge, Chrome or Firefox, drop the HEIC files and click Convert. Nothing is installed and no add-on is needed, because the conversion runs inside the browser tab. It works the same on macOS, Linux, ChromeOS and Android.',
    },
    {
      q: 'What happens to a see-through background when converting to JPG?',
      a: 'JPG cannot store a see-through background, so see-through areas in a PNG, WebP or SVG become white. Convert to PNG or WebP instead if you need to keep them.',
    },
  ],
  entities: ['HEIC', 'iPhone photos', 'JPG', 'PNG', 'WebP', 'SVG', 'GIF', 'BMP'],
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
    'Convert HEIC to JPG, PNG or WebP in your browser. Photos are never uploaded, they come out the right way up, and batches download as one ZIP. Works on Windows.',
}

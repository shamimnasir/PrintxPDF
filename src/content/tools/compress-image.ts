import type { ToolContent } from './types'

export const compressImage: ToolContent = {
  slug: 'compress-image',
  answer:
    'Compress an image by dropping JPG, PNG, WebP or HEIC files into Compress Image, setting a quality and optionally a maximum size, then clicking Compress. It runs in your browser with no upload, shows before and after side by side, and never returns a file larger than the original.',
  whatHeading: 'What are JPG, PNG and WebP, and how do they compress?',
  what: [
    {
      term: 'What is a JPG file?',
      definition:
        'JPG (JPEG, ISO 10918) is the standard photo format and the one that responds best to compression. It stores the picture as 8 by 8 pixel blocks transformed with a discrete cosine transform, and a quality setting decides how much fine detail is thrown away. Going from quality 100 to 80 typically halves the file with no visible change; below 60, blocks and halos start to appear around edges.',
    },
    {
      term: 'What is a PNG file?',
      definition:
        'PNG (ISO 15948) is lossless: every pixel is stored exactly, packed with DEFLATE, and there is no quality dial to turn. That makes it perfect for screenshots, logos and diagrams, and it is why a PNG cannot be shrunk by re-encoding at a lower quality in the browser. The two ways to make a PNG smaller are to reduce its pixel dimensions or to switch it to a lossy format such as JPG or WebP.',
    },
    {
      term: 'What is a WebP file?',
      definition:
        'WebP is Google\'s web image format with both lossy and lossless modes and support for transparency. In lossy mode it is usually 25 to 35 percent smaller than a JPG at similar visual quality, so converting to WebP while compressing gives the biggest savings for website images. All current browsers display it; older desktop software and some printers do not, so keep JPG for anything that leaves the web.',
    },
  ],
  whyHeading: 'Why compress images?',
  why: [
    {
      h: 'Get under upload and email limits',
      x: 'Forms, job portals and mail servers reject a 12 MB phone photo. Quality 80 and a 1920 pixel limit turns it into a few hundred kilobytes that looks the same on screen.',
    },
    {
      h: 'Faster pages and lower storage bills',
      x: 'Images are most of a web page\'s weight. Smaller files mean quicker loads, better search rankings and less bandwidth and storage paid for each month.',
    },
    {
      h: 'See the trade-off before you commit',
      x: 'The original and the compressed version sit next to each other with the new size shown, so you can nudge the quality slider until it is as small as you can accept.',
    },
    {
      h: 'Nothing leaves your computer',
      x: 'Resizing and re-encoding happen in the browser tab. Photos of people, documents and unreleased work are never uploaded anywhere.',
    },
    {
      h: 'Never worse than what you started with',
      x: 'If re-encoding would make a file bigger, which happens with already well-compressed images, the tool hands back the original and tells you so.',
    },
  ],
  howHeading: 'How to compress an image, step by step',
  how: [
    {
      h: 'Open Compress Image and drop your photos',
      x: 'Drag PNG, JPG, WebP or HEIC files onto the drop zone. Add as many as you like; the whole batch uses the same settings.',
    },
    {
      h: 'Set the quality',
      x: 'Move the **Quality** slider between 30 and 100. 80 is the default and a sensible starting point for photos. The preview updates and shows the new size against the old one.',
    },
    {
      h: 'Optional: limit the longest side',
      x: 'Tick **Limit longest side** and choose 1920, 1280 or 800 pixels, or type your own. Anything larger is scaled down while keeping its proportions; smaller images are left alone. This is the setting that shrinks a PNG.',
    },
    {
      h: 'Choose the output format',
      x: 'Leave **Keep** to stay in the original format, or pick **JPG** or **WebP** for the smallest result. Converting a PNG photo to JPG or WebP is the biggest single saving you can make.',
    },
    {
      h: 'Click Compress and download',
      x: 'Press **Compress image** (or **Compress N images**). Each file is re-encoded in your browser with its EXIF orientation applied, and the results download individually or as one ZIP.',
    },
  ],
  faqs: [
    {
      q: 'Why can I not compress a PNG with the quality slider?',
      a: 'PNG is lossless, so the browser has no quality setting to lower. Compress Image tells you this when a PNG is selected with no size limit and the format set to Keep. To shrink it, either turn on a longest-side limit to reduce the pixel dimensions or switch the output to JPG or WebP.',
    },
    {
      q: 'Does compressing reduce image quality?',
      a: 'With JPG and WebP, yes, by a controlled amount. At quality 80 the loss is invisible at normal viewing size; at 50 it shows as soft edges and blocky gradients. Downscaling with the size limit also removes pixels, which matters for printing but not for screens. The side-by-side preview lets you judge before saving.',
    },
    {
      q: 'Are my images uploaded?',
      a: 'No. Decoding, resizing and re-encoding all run inside your browser, and HEIC photos are decoded by a WebAssembly build of libheif loaded on first use. Nothing is sent to a server.',
    },
    {
      q: 'Will the tool ever make a file larger?',
      a: 'No. Every result is compared with the original, and if re-encoding would have grown it, you get the original back with a note saying so. Files that are already small and well compressed are the usual case.',
    },
    {
      q: 'Will my phone photos stay the right way up?',
      a: 'Yes. The EXIF orientation tag is read and the rotation is baked into the pixels before encoding, so the compressed image displays correctly in every app, including ones that ignore EXIF.',
    },
  ],
  entities: ['JPEG', 'PNG', 'WebP', 'HEIC', 'EXIF', 'DEFLATE', 'libheif'],
  keywords: [
    'compress image',
    'image compressor online',
    'compress jpg',
    'compress png',
    'reduce image size',
    'compress image without losing quality',
    'resize image for email',
  ],
  metaTitle: 'Compress Image: Shrink JPG, PNG and WebP in Your Browser',
  metaDescription:
    'Compress images in your browser with no upload. Pick a quality, cap the longest side, compare before and after, and never get a file bigger than the original.',
}

import type { ToolContent } from './types'

export const compressImage: ToolContent = {
  slug: 'compress-image',
  answer:
    'Compress Image makes JPG, PNG, WebP or HEIC photos smaller. Drop your files, pick a quality level, set a maximum size if you like, and click Compress. It runs in your browser with no upload, shows before and after side by side, and never returns a bigger file.',
  whatHeading: 'What are JPG, PNG and WebP, and how do they get smaller?',
  what: [
    {
      term: 'What is a JPG file?',
      definition:
        'JPG (also written JPEG) is the everyday photo format and the one that shrinks best. It saves space by quietly dropping fine detail your eye would not notice, and a quality setting decides how much detail to drop. Going from quality 100 to 80 usually halves the file with no visible change. Below 60, you start to see blocky patches and fuzzy halos around edges.',
    },
    {
      term: 'What is a PNG file?',
      definition:
        'PNG stores every single dot of the picture exactly, with nothing thrown away. That makes it perfect for screenshots, logos and diagrams, and it is why there is no quality slider for PNG: there is no detail to drop. The two ways to make a PNG smaller are to reduce its size in pixels, or to switch it to a format like JPG or WebP that is allowed to drop detail.',
    },
    {
      term: 'What is a WebP file?',
      definition:
        'WebP is a newer picture format made for websites. It can drop detail like JPG or keep every dot like PNG, and it supports see-through backgrounds. A WebP photo is usually 25 to 35 percent smaller than a JPG that looks the same, so switching to WebP while compressing gives the biggest savings for website pictures. All current browsers show it. Older desktop programs and some printers do not, so keep JPG for anything that leaves the web.',
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
      x: 'Pictures are most of a web page\'s weight. Smaller files mean quicker loads, better search rankings and less storage paid for each month.',
    },
    {
      h: 'See the trade-off before you commit',
      x: 'The original and the compressed version sit next to each other with the new size shown, so you can nudge the quality slider until it is as small as you can accept.',
    },
    {
      h: 'Nothing leaves your computer',
      x: 'Shrinking and re-saving happen in the browser tab. Photos of people, documents and unreleased work are never uploaded anywhere.',
    },
    {
      h: 'Never worse than what you started with',
      x: 'If shrinking would make a file bigger, which happens with pictures that are already well compressed, the tool hands back the original and tells you so.',
    },
  ],
  howHeading: 'How to compress an image, step by step',
  how: [
    {
      h: 'Open Compress Image and drop your photos',
      x: 'Drag PNG, JPG, WebP or HEIC files (HEIC is the photo format iPhones use) onto the drop zone. Add as many as you like; the whole batch uses the same settings.',
    },
    {
      h: 'Set the quality',
      x: 'Move the **Quality** slider between 30 and 100. 80 is the default and a sensible starting point for photos. The preview updates and shows the new size against the old one.',
    },
    {
      h: 'Optional: limit the longest side',
      x: 'Tick **Limit longest side** and choose 1920, 1280 or 800 pixels, or type your own. Anything larger is scaled down while keeping its shape; smaller pictures are left alone. This is the setting that shrinks a PNG.',
    },
    {
      h: 'Choose the output format',
      x: 'Leave **Keep** to stay in the original format, or pick **JPG** or **WebP** for the smallest result. Turning a PNG photo into JPG or WebP is the biggest single saving you can make.',
    },
    {
      h: 'Click Compress and download',
      x: 'Press **Compress image** (or **Compress N images**). Each file is re-saved in your browser the right way up, and the results download one by one or as one ZIP.',
    },
  ],
  faqs: [
    {
      q: 'Why can I not compress a PNG with the quality slider?',
      a: 'PNG keeps every dot exactly, so there is no detail to drop and no quality setting to lower. Compress Image tells you this when a PNG is selected with no size limit and the format set to Keep. To shrink it, either turn on a longest-side limit to make it smaller in pixels, or switch the output to JPG or WebP.',
    },
    {
      q: 'Does compressing reduce picture quality?',
      a: 'With JPG and WebP, yes, by a controlled amount. At quality 80 the loss is invisible at normal viewing size; at 50 it shows as soft edges and blocky shading. Shrinking with the size limit also removes dots, which matters for printing but not for screens. The side-by-side preview lets you judge before saving.',
    },
    {
      q: 'Are my pictures uploaded?',
      a: 'No. Reading, shrinking and re-saving all run inside your browser. For HEIC photos, a small decoder is fetched once on first use so your browser can open them. Nothing is sent to a server.',
    },
    {
      q: 'Will the tool ever make a file larger?',
      a: 'No. Every result is compared with the original, and if shrinking would have made it bigger, you get the original back with a note saying so. Files that are already small and well compressed are the usual case.',
    },
    {
      q: 'Will my phone photos stay the right way up?',
      a: 'Yes. Phones often save a photo sideways and add a hidden note saying which way is up. Some apps ignore that note. This tool reads it and turns the picture the right way before saving, so the compressed image looks correct in every app.',
    },
  ],
  entities: ['JPEG', 'PNG', 'WebP', 'HEIC', 'Image compression', 'Photo file size'],
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
    'Compress pictures in your browser with no upload. Pick a quality, cap the longest side, compare before and after, and never get a file bigger than the original.',
}

import type { ToolAlias } from './toolAliases'
import type { ToolContent } from './tools/types'

const formatName = (format: ToolAlias['target']) => (format === 'jpg' ? 'JPG' : format === 'png' ? 'PNG' : 'WebP')

/** Builds focused editorial content for a format-specific landing page without duplicating tool UI. */
export function toolAliasContent(alias: ToolAlias): ToolContent {
  const target = formatName(alias.target)
  const source = alias.source
  const isLossless = alias.target === 'png'
  const isVector = source === 'SVG'
  return {
    slug: alias.slug,
    answer: alias.answer,
    whatHeading: `What is ${source} to ${target} conversion?`,
    what: [
      {
        term: `${source} is the file you already have`,
        definition: `${source} files are common in phones, websites, design tools and upload workflows. This page accepts ${source} files and sends them to the same private browser converter as the main Image Converter.`,
      },
      {
        term: `${target} is the file you need`,
        definition: `${target} is the output selected for this page. ${isLossless ? 'It keeps exact pixel values and can preserve transparency.' : target === 'JPG' ? 'It opens almost everywhere and has a quality setting, but it cannot store transparent pixels.' : 'It is a compact web format that can keep transparency and lets you choose the quality.'}`,
      },
    ],
    whyHeading: `Why convert ${source} to ${target}?`,
    why: [
      { h: 'Match the format a form or app accepts', x: `${target} is a practical output for sharing, uploading, editing, or publishing when the original format is refused.` },
      { h: 'Keep the original private', x: 'The image is decoded and encoded in this browser tab. Your photo or artwork is not uploaded to a conversion server.' },
      { h: 'Process a batch instead of one file at a time', x: 'Drop several source files together and download the converted results individually or as one ZIP.' },
      { h: isVector ? 'Choose the raster size' : 'Choose the quality you need', x: isVector ? 'SVG has no fixed pixel size, so choose a scale or exact width before creating the PNG or JPG.' : `${target === 'JPG' || target === 'WebP' ? 'Use the quality slider to balance file size and detail.' : 'PNG keeps exact pixels and does not use a quality slider.'}` },
    ],
    howHeading: `How to convert ${source} to ${target}`,
    how: [
      { h: `Open the ${source} to ${target} converter`, x: `Drop your ${source} files into the browser workbench below. The page accepts a batch, so you can convert several images in one pass.` },
      { h: `Check the ${target} output`, x: `The ${target} option is selected for this page. You can change it if you need another image format.` },
      { h: isVector ? 'Set the raster size' : 'Set quality if available', x: isVector ? 'Choose a scale or enter an exact width in pixels. Add a white background when the destination cannot display transparency.' : `${target === 'JPG' || target === 'WebP' ? 'Move the quality slider between 40 and 100. Higher values keep more detail and create larger files.' : 'PNG preserves the source pixels and has no quality slider.'}` },
      { h: 'Convert and download', x: `Click Convert to ${target}. The preview shows the result, then download each file or the full batch as a ZIP.` },
    ],
    faqs: [
      { q: `Are my ${source} files uploaded?`, a: 'No. This conversion runs in your browser. The files stay on your device and are not sent to PrintxPDF.' },
      { q: `Can I convert more than one ${source} file?`, a: 'Yes. Select or drop several files, convert them together, and download the results as a ZIP.' },
      { q: `What happens to transparency when converting to ${target}?`, a: target === 'JPG' ? 'JPG cannot store transparency, so transparent areas become white. Choose PNG or WebP when the transparent background matters.' : 'PNG and WebP can preserve transparency when the source contains it. For SVG, you can also choose a white background deliberately.' },
    ],
    entities: [source, target, 'image converter', 'browser conversion', 'private file conversion'],
    keywords: alias.keywords,
    metaTitle: alias.metaTitle,
    metaDescription: alias.metaDescription,
  }
}


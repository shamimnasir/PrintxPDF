# Multilingual article release draft

This folder holds translations that are not yet imported by the site. Do not add these guides to
`localizedGuidesFull.ts` or publish them until the complete English article set is translated for
all seven supported locales. This keeps the public release complete rather than exposing partial
language coverage.

Each article file uses the English guide slug as `topic`, identifies its English source silo, and
stores localized title, search metadata, answer, body, tool CTA and FAQs under each locale.
Supported locales are `es`, `pt-BR`, `hi`, `ar`, `bn`, `vi`, and `zh-CN`.

## Inventory at start

The site has 225 English guide routes. Current translation coverage, measured by matching each
English route's slug against localized guide topics:

| Locale | Existing | Missing |
| --- | ---: | ---: |
| Spanish (`es`) | 110 | 115 |
| Brazilian Portuguese (`pt-BR`) | 1 | 224 |
| Hindi (`hi`) | 61 | 164 |
| Arabic (`ar`) | 110 | 115 |
| Bengali (`bn`) | 110 | 115 |
| Vietnamese (`vi`) | 110 | 115 |
| Simplified Chinese (`zh-CN`) | 110 | 115 |

Total remaining: **963 localized guide pages**. Five completed drafts translate `merge-pdf-without-adobe-free`,
`merge-pdf-files-in-order`, `merge-pdf-without-uploading-files`,
`merge-pdf-files-on-phone-or-computer`, and
`merge-scanned-pdfs-into-one-searchable-file` into all seven locales. This is 35 of the 963 missing
localized pages; 928 remain. More drafts should be added one English article at a time, with all seven locales
represented before integration.

## Release checks

- Preserve the existing English topic slug so alternates and silo matching work.
- Translate all visible content, including title, metadata, answer, body, table, CTA and FAQs.
- Keep tool links and product claims accurate. Tool controls are not fully localized.
- Meet the existing localization validator: at least 250 whitespace-delimited body words, or 800
  non-space CJK characters, at least three FAQs, a localized CTA, and an in-range meta description.
- Import complete locale bundles in `src/content/localizedGuidesFull.ts`, then run the prescribed
  checks, build, static audit and IndexNow notification before pushing the release to `main`.

# Multilingual article release draft

This folder holds the source drafts for a rolling multilingual release. A topic may be published
once all seven translations are complete and pass the content checks. Unfinished topics stay here
unpublished. The release goal remains translating and publishing every English guide in all seven
locales; see the inventory below for overall progress.

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

The inventory above is the starting snapshot. Rolling releases are published by complete topic across all seven locales. Some articles in rolling release 50 already had localized routes and were refreshed, so route coverage is measured by unique topics rather than the number of entries added to the bundle. The generated route inventory currently contains 180 unique translated topics in each locale out of 225 English guides. **45 topics per locale, or 315 localized guide pages, remain.**

## Rolling release checks

For each release batch, import only topics with all seven locales, add matching localized route
entries, verify reciprocal hreflang, run the build and static site audit, then deploy and notify
IndexNow. Google is not part of IndexNow. Continue adding and publishing complete topics until all
225 English guides have all seven translations.

## Full release checks

- Preserve the existing English topic slug so alternates and silo matching work.
- Translate all visible content, including title, metadata, answer, body, table, CTA and FAQs.
- Keep tool links and product claims accurate. Tool controls are not fully localized.
- Meet the existing localization validator: at least 250 whitespace-delimited body words, or 800
  non-space CJK characters, at least three FAQs, a localized CTA, and an in-range meta description.
- Import complete locale bundles in `src/content/localizedGuidesFull.ts`, then run the prescribed
  checks, build, static audit and IndexNow notification before pushing the release to `main`.

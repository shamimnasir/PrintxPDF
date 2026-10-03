# International search content pilot

Updated: October 3, 2026

## Decision

Start with Spanish (`es`), Brazilian Portuguese (`pt-BR`), Hindi (`hi`) and Arabic
(`ar`). These give the site access to large, distinct language audiences while using
four different search markets and writing systems. The first release covers three
high-intent jobs with working tools: merge PDFs, compress PDFs and turn photos into a
PDF. This is a testable pilot, not a claim that every page or the application UI has
been fully localized.

The phrase families were checked against live localized PDF-tool results and product
pages: Spanish searches use forms such as “unir PDF” and “comprimir PDF”; Brazilian
Portuguese uses “juntar PDF” and “comprimir PDF”; Arabic tool navigation prominently
uses “دمج PDF” and “ضغط PDF”; Hindi content targets natural task phrasing around
merging/compressing PDF and converting a photo to PDF. These are observed intent
patterns, not keyword-volume estimates. Do not invent volume, ranking or traffic claims.

## Published pilot routes

| Language | Hub | Merge | Compress | Images to PDF |
| --- | --- | --- | --- | --- |
| Spanish | `/es/guias` | `/es/guias/unir-pdf` | `/es/guias/comprimir-pdf` | `/es/guias/convertir-fotos-a-pdf` |
| Brazilian Portuguese | `/pt-br/guias` | `/pt-br/guias/juntar-pdf` | `/pt-br/guias/comprimir-pdf` | `/pt-br/guias/converter-fotos-para-pdf` |
| Hindi | `/hi/guides` | `/hi/guides/pdf-merge-kaise-kare` | `/hi/guides/pdf-compress-kaise-kare` | `/hi/guides/photo-se-pdf-kaise-banaye` |
| Arabic | `/ar/adella` | `/ar/adella/damj-pdf` | `/ar/adella/daght-pdf` | `/ar/adella/sowar-ila-pdf` |

Each page is server-rendered into static HTML, has a language-specific title and
description, visible answers and FAQs, a real tool CTA, a canonical, reciprocal
`hreflang` alternates across translations, and matching `Article` / `FAQPage` schema.
The Arabic pages set RTL direction. Footer and English blog links expose every hub;
the sitemap and `llms.txt` enumerate each page.

## Editorial rules

- Translate the user's task and search phrasing naturally, not word for word.
- Explain exact input formats, what the tool preserves or changes, the local/server
  processing behavior, limitations and checks to make before sharing the result.
- Link only to an existing tool and accurately describe its functionality.
- Do not imply that the interface itself is fully translated. The tool controls may
  remain in English; the guide says this explicitly.
- Do not publish thin keyword doorway pages. Each guide must answer a real task and
  include steps, limits and useful FAQs in the target language.
- Do not claim measured demand until Search Console provides impressions and query
  data. Do not scale into more languages until a native-language review is possible.

## Measurement and next steps

1. Deploy, then inspect the new URLs in Google Search Console. Request indexing for
   representative hubs and guides; Google decides whether and when to index them.
2. After the pages collect data, group Search Console queries by locale and task.
   Track impressions, clicks, CTR, average position, indexing state and tool CTA
   clicks separately for each language.
3. Fix queries that expose a real answer gap first. Expand into PDF-to-JPG, OCR,
   HEIC-to-JPG or print-web-page topics only when the tool supports the promise and
   the first cohort indicates useful demand.
4. Get native-speaker editorial review before adding more locales or using paid
   translation as publish-ready content.

## AdSense readiness note

The site currently loads GA4 (unless Do Not Track is enabled), so the privacy policy
must not say the site sets no cookies or uses no analytics. The policy identifies
analytics, local storage, Stripe and AdSense behavior. The AdSense publisher tag is in
`index.html`, which is included in each prerendered page. The account's actual ad-serving
and consent-message settings were not independently checked in this task. Before
personalized ads are served to users in the EEA, UK and Switzerland, configure the
Google-certified IAB TCF CMP required by Google. A policy page does not replace that
account configuration.

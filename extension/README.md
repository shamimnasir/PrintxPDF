# PrintxPDF — Chrome extension (Manifest V3)

One click puts the page you are reading into <https://printxpdf.com/print>, where
Readability strips the ads, menus and comment walls and you can delete blocks,
resize text and images, then Print, save a PDF or PNG, or email it.

The extension itself is a launcher. All the cleaning and exporting happens on the
site, in your browser — nothing is uploaded and the extension makes no network
requests of its own.

## What you get

| Surface | What it does |
| --- | --- |
| Toolbar popup | "Clean this page", "Paste text" (opens the paste box, works even on pages Chrome walls off), "Copy clean link", and an "Open in a new tab" preference. |
| Keyboard shortcut | `Alt+Shift+P` / `Command+Shift+P` → clean the current page. Rebind it at `chrome://extensions/shortcuts`. |
| Right-click on a page | **Clean this page for printing** |
| Right-click on a link | **Clean this link** — cleans the link's target without visiting it first. |
| Right-click on a selection | **Print just this selection** — see below. |

### How the selection item works (and why)

printxpdf.com is a static, client-side site. It has no ingest API, and a query
string cannot carry a page's worth of selected markup — so the extension does
not pretend otherwise:

1. It serialises your selection as HTML (absolute `src`/`href`, scripts and
   iframes dropped) with the page title and source URL on top.
2. It copies that to your clipboard, in the page, and shows a short notice.
3. It opens `printxpdf.com/print?paste=1`.
4. On that page, choose the **Paste HTML or text** tab and press `Cmd/Ctrl+V`.

If a page blocks clipboard access, the notice says so rather than failing
silently, and the popup repeats the instruction the next time you open it.

## Load it unpacked (testing)

```
chrome://extensions → turn on Developer mode → Load unpacked → pick this extension/ folder
```

Reload the extension from that page after editing any file. Chrome pages
(`chrome://`, the Web Store, the new tab page) cannot be read by any extension;
the popup says so and offers to open PrintxPDF instead.

## Permissions, and why each one is here

| Permission | Why |
| --- | --- |
| `activeTab` | Read the URL of the tab you are on, but **only** for the tab you just acted on, and **only** after you click the icon, pick a context-menu item or press the shortcut. The grant expires when you navigate away. Read through `chrome.tabs.query`; no `tabs` permission and no injection. |
| `scripting` | **One** one-shot injection, for "Print just this selection" only: serialise the selection and copy it. There is no persistent content script and no `content_scripts` manifest entry. |
| `clipboardWrite` | Put that selection on the clipboard. `navigator.clipboard.writeText` first; `document.execCommand('copy')` when a page's permissions policy refuses the async API, which is the path Chrome requires this permission for. Write only, never read. |
| `contextMenus` | The three right-click items. |
| `storage` | The "Open in a new tab" checkbox (`storage.sync`) and a short-lived note about the last copied selection (`storage.local`). |

**There is no `host_permissions` entry, and no `<all_urls>`.** A launcher that
only needs the current tab's URL at the moment you ask for it does not need
standing access to every site you visit. `activeTab` grants exactly that, one
tab at a time, on your gesture — which means no "Read and change all your data
on all websites" warning at install, and a much shorter Web Store review.

No `host_permissions` also means no remote code, no analytics and no background
network traffic. Everything in the package is local; see `PRIVACY.md`.

## Files

```
extension/
  manifest.json      MV3 manifest
  background.js      service worker (module): context menus, command, tab opening
  popup.html/.css/.js  300px popup, matching the site's "Studio" tokens
  icons/             icon-16/32/48/128.png (generated, real PNGs)
  tools/make-icons.mjs  regenerates the icons; excluded from the package
  README.md / PRIVACY.md / STORE_LISTING.md  docs; all excluded from the package
```

Regenerate the icons after changing the artwork:

```
node extension/tools/make-icons.mjs
```

## Package it

```
node scripts/build-extension.mjs
```

That validates the manifest (required keys, MV3, a 1-4 integer version string,
Web Store name/`short_name`/description limits, `default_locale` matching
`_locales/`, and that every referenced file and icon exists at the right pixel
size), audits every shipped file for remote code and CSP violations (`eval`,
`new Function`, `importScripts`, inline `<script>`, inline `on*=` handlers,
remote `<script src>`/stylesheets/`@import`, `fetch`, `XMLHttpRequest`,
`WebSocket`) and fails the build on any hit, then writes:

- `dist-extension/printxpdf-extension-v<version>.zip` — upload this
- `public/downloads/printxpdf-chrome-extension.zip` — the same bytes, for the site

`manifest.json` sits at the archive root; Chrome rejects a zip with a wrapping
folder. `tools/` and every `.md` file are excluded from the package.

## Submitting to the Chrome Web Store

Not submitted yet. **`STORE_LISTING.md` in this folder is the submission pack**:
the exact text for every dashboard field (listing copy, single purpose, a
justification per permission, the remote-code declaration, the data-collection
answers and the privacy-policy URL), the images a human still has to shoot, and
a step-by-step checklist. Start there.

Two things are not done and cannot be done from here:

1. **`https://printxpdf.com/extension-privacy` does not exist.** The Web Store
   requires a live privacy-policy URL. The final text is in `PRIVACY.md`;
   publishing it is a `src/` change for whoever owns that directory.
2. **The screenshots.** They have to be taken from a real Chrome window with the
   extension loaded. `STORE_LISTING.md` section 4 says exactly what each one
   should show.

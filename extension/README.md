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
| Toolbar popup | "Clean this page", "Save as PDF" (same route; export from the editor), "Copy clean link", and an "Open in a new tab" preference. |
| Keyboard shortcut | `Ctrl+Shift+Y` / `Command+Shift+Y` → clean the current page. Chrome already owns `Ctrl/Cmd+Shift+P`, so this uses Y. Rebind it at `chrome://extensions/shortcuts`. |
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
| `activeTab` | Read the URL of the tab you are on, but **only** for the tab you just acted on, and **only** after you click the icon, pick a context-menu item or press the shortcut. The grant expires when you navigate away. |
| `scripting` | Two one-shot injections: read `location.href` when Chrome withholds `tab.url`, and serialise + copy a selection. There is no persistent content script. |
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
```

Regenerate the icons after changing the artwork:

```
node extension/tools/make-icons.mjs
```

## Package it

```
node scripts/build-extension.mjs
```

That validates the manifest (required keys, MV3, version string, Web Store
name/description limits, and that every referenced file and icon exists at the
right pixel size), then writes:

- `dist-extension/printxpdf-extension-v<version>.zip` — upload this
- `public/downloads/printxpdf-chrome-extension.zip` — the same bytes, for the site

`manifest.json` sits at the archive root; Chrome rejects a zip with a wrapping
folder. `tools/`, `README.md` and `PRIVACY.md` are excluded from the package.

## Submitting to the Chrome Web Store

Not submitted yet. What a submission needs:

1. A Chrome Web Store developer account and the one-time **$5** registration fee.
2. The zip from `dist-extension/` (upload the versioned file; bump
   `manifest.json`'s `version` for every upload — the store rejects a repeat).
3. **Store listing**: name, a short description (132 chars max, already enforced
   by the build script), a detailed description, category (Productivity),
   language, and the developer's public contact email (verified).
4. **Graphics**: a 128×128 icon (in the package), at least one 1280×800 or
   640×400 screenshot (up to five), and optionally a 440×280 small promo tile.
5. **Privacy tab**: a single-purpose statement ("send the current tab's URL to
   printxpdf.com so the page can be cleaned for printing"), a justification for
   each permission — reuse the table above — a "no remote code" declaration, a
   link to a hosted privacy policy, and the data-collection disclosure: this
   extension collects **nothing**, so every category is "No".
6. Review typically takes a few days; permission-light extensions clear faster,
   which is the other reason there is no `<all_urls>` here.

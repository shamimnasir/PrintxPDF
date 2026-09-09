# Chrome Web Store submission pack — PrintxPDF

Everything a human has to paste into the Chrome Web Store developer dashboard,
field by field, plus the images that still have to be produced by hand.

Package to upload: `dist-extension/printxpdf-extension-v1.0.0.zip`
(produced by `node scripts/build-extension.mjs`; `manifest.json` sits at the
archive root, and README / PRIVACY / STORE_LISTING / `tools/` are excluded).

Policy sources this pack was checked against:

- <https://developer.chrome.com/docs/webstore/program-policies>
- <https://developer.chrome.com/docs/webstore/program-policies/quality-guidelines> (single purpose)
- <https://developer.chrome.com/docs/webstore/program-policies/permissions> (narrowest permissions)
- <https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements> (remote code)
- <https://developer.chrome.com/docs/webstore/program-policies/user-data-faq> (privacy policy + disclosures)
- <https://developer.chrome.com/docs/webstore/program-policies/limited-use>
- <https://developer.chrome.com/docs/webstore/cws-dashboard-listing>
- <https://developer.chrome.com/docs/webstore/cws-dashboard-privacy>
- <https://developer.chrome.com/docs/webstore/review-process>
- <https://developer.chrome.com/docs/extensions/reference/permissions-list>
- <https://developer.chrome.com/blog/cws-policy-updates-2026> (Limited Use tightened, effective 1 Aug 2026)

---

## 1. Store listing tab

**Item name** (from `manifest.json`, 33 characters)

```
PrintxPDF — Print Web Pages Clean
```

**Short description** (the dashboard reuses the manifest `description`; 121 of
the 132 characters allowed)

```
Opens the page you are reading in PrintxPDF, which strips it down to the article so you can print it or save a clean PDF.
```

**Category:** Productivity → Workflow & Planning
**Language:** English (United States)

**Detailed description** (paste verbatim)

```
Printing a web page usually wastes paper on navigation bars, cookie banners, ad
slots, related-article rails and a mile of comments. PrintxPDF sends the page you
are reading to printxpdf.com, which strips it down to the article itself, then
lets you print it or save it as a clean PDF.

HOW IT WORKS

1. Open any article.
2. Click the PrintxPDF icon, press the keyboard shortcut, or right-click the page.
3. The article opens on printxpdf.com, already cleaned. Delete any block you do
   not want, resize the text and images, then print, save a PDF, or save a PNG.

WHAT YOU CAN DO FROM THE TOOLBAR

• Clean this page — hands the current tab to the cleaner.
• Paste text — opens the paste box, so you can clean text from a page Chrome
  will not let extensions touch, or from anywhere else.
• Copy clean link — copies a printxpdf.com link for the current page, ready to
  send to somebody.
• Open in a new tab — a preference, on by default, so your reading is not lost.

WHAT YOU CAN DO FROM THE RIGHT-CLICK MENU

• Clean this page for printing.
• Clean this link — cleans a link's target without visiting it first.
• Print just this selection — copies the part you highlighted, with its
  formatting, and opens the paste box so you can print only that.

KEYBOARD SHORTCUT

Alt+Shift+P on Windows, Linux and ChromeOS; Command+Shift+P on macOS. Change it
at chrome://extensions/shortcuts.

PRIVACY

The extension collects nothing and sends nothing anywhere. It has no analytics,
no trackers, no third-party libraries and no remote code. It does not ask for
access to your websites: it uses Chrome's activeTab permission, which gives it
the address of one tab, only after you click, and only until you navigate away.
That is why Chrome never warns you that this extension can "read and change all
your data on all websites" — it cannot.

The cleaning itself happens on printxpdf.com, in your own browser. No document is
uploaded to a server.

Privacy policy: https://printxpdf.com/extension-privacy
```

---

## 2. Privacy practices tab

### Single purpose (paste into the "Single purpose" field)

```
PrintxPDF has one purpose: to open the page you are currently reading in
printxpdf.com's print cleaner, so it can be printed or saved as a PDF without
the ads, navigation and comments. The extension is a launcher and does nothing
else. Every one of its surfaces — the toolbar popup, the three context-menu
items and the keyboard shortcut — performs that same action on the current tab,
a right-clicked link, or a text selection. It has no unrelated features
bundled with it.
```

### Permission justifications (one field per permission)

Every permission below is called by shipped code; nothing is requested for a
feature that does not exist. `grep -o 'chrome\.[a-z]*\.[a-zA-Z]*' extension/*.js`
is the proof.

| Permission | Justification to paste |
| --- | --- |
| `activeTab` | `The extension needs the web address of the tab the user is looking at, so it can open that address in printxpdf.com's print cleaner. activeTab is the narrowest permission that provides it: it grants access to a single tab, only after the user clicks the toolbar icon, chooses a PrintxPDF context-menu item, or presses the extension's keyboard shortcut, and the grant expires when that tab navigates. The extension deliberately declares no host_permissions and no <all_urls>, because it never needs standing access to any site. It is read in popup.js and background.js via chrome.tabs.query, and the only field used is tab.url.` |
| `contextMenus` | `The extension adds exactly three right-click items: "Clean this page for printing" (page context), "Clean this link" (link context) and "Print just this selection" (selection context). chrome.contextMenus.create is the only API that can add them; they are created once in the runtime.onInstalled handler in background.js and removed automatically on uninstall. No other menus are added.` |
| `storage` | `The extension stores two small values on the user's own machine and nothing else. chrome.storage.sync holds "openInNewTab", the state of the "Open in a new tab" checkbox in the popup, so the preference follows the user's Chrome profile. chrome.storage.local holds "lastSelection": a timestamp and a boolean recording whether the last clipboard copy succeeded, so the popup can remind the user to paste. Neither value contains page content, selected text, browsing history or anything identifying, and neither is transmitted anywhere.` |
| `scripting` | `Used for exactly one feature: the "Print just this selection" context-menu item. chrome.scripting.executeScript runs a single function, once, in the tab the user just right-clicked, which serialises the user's own text selection into HTML and copies it to the clipboard. printxpdf.com is a static client-side site with no upload endpoint, and a URL query string cannot carry a page of markup, so the clipboard is how the selection reaches the paste box. There is no persistent content script and no content_scripts entry in the manifest. The injection is only ever attempted on http/https tabs, and only in response to the user's own click on that menu item, under the activeTab grant that click creates.` |
| `clipboardWrite` | `The "Print just this selection" feature has to place the user's selected text on the clipboard, because that is how the selection reaches the paste box on printxpdf.com. The injected function calls navigator.clipboard.writeText and, when a page's permissions policy refuses the async Clipboard API, falls back to document.execCommand('copy'); Chrome requires the clipboardWrite permission for that fallback and to write reliably without transient activation. The extension only ever writes to the clipboard, never reads it, and only writes content the user selected themselves or a printxpdf.com link the user asked to copy.` |

### Are you using remote code?

Select **No, I am not using remote code**, and paste:

```
All logic ships inside the package. There is no <script> tag pointing outside
the extension, no eval(), no new Function(), no importScripts(), no CDN, no
remotely hosted fonts or stylesheets, and no code fetched or interpreted at
runtime. The popup loads one local script (popup.js) with a normal src
attribute, has no inline script block and no inline event handler attributes,
and the manifest declares the strict default extension_pages CSP
("script-src 'self'; object-src 'self'"). The extension makes no network
requests of any kind. The build script (scripts/build-extension.mjs) fails the
build if any of those patterns appear in a shipped file.
```

### Data usage — what user data do you collect?

Tick **nothing**. Every category is **No**:

| Category | Answer |
| --- | --- |
| Personally identifiable information | No |
| Health information | No |
| Financial and payment information | No |
| Authentication information | No |
| Personal communications | No |
| Location | No |
| Web history | No |
| User activity | No |
| Website content | No |

Rationale if a reviewer asks: the extension never transmits anything. The tab's
URL is used, in the moment, to build the address of a new tab the user opens;
the user's selection is placed on the user's own clipboard. Neither leaves the
device by way of this extension, and neither is retained. The two values in
`chrome.storage` are a checkbox state and a success flag.

### Certifications (tick all three)

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

### Privacy policy URL

```
https://printxpdf.com/extension-privacy
```

> **⚠ ACTION REQUIRED BY ANOTHER ENGINEER.** That page does not exist yet. The
> Chrome Web Store rejects a submission whose privacy-policy URL 404s, and a
> policy is mandatory for any item that handles user data (which includes
> reading a tab's URL). The final text is in `extension/PRIVACY.md`; it needs to
> be published as a public, non-authenticated page at
> `https://printxpdf.com/extension-privacy`. That is a `src/` change, which is
> outside this extension's ownership — whoever owns `src/` must add the route
> and the prerender entry, and confirm the URL returns 200 before submission.

---

## 3. Distribution tab

- Visibility: **Public**
- Regions: **All regions**
- Pricing: **Free**, no in-app purchases

---

## 4. Images a human still has to produce

**These cannot be generated here.** Screenshots of a Chrome extension have to be
taken from a real Chrome window with the extension loaded, and no such window
exists in this environment. The list below is what the dashboard will ask for.

| Asset | Size | Required? | What it should show |
| --- | --- | --- | --- |
| Store icon | 128×128 PNG | **Yes** | Already in the package: `extension/icons/icon-128.png`. Upload the same file; the dashboard keeps its own copy. Keep ~16px of padding inside the square so it is not clipped in the rounded store frame. |
| Screenshot 1 | 1280×800 PNG or JPEG | **Yes, at least one** | The money shot: a real cluttered article on the left, the same article cleaned on printxpdf.com on the right, side by side. This is the single most persuasive image and the one reviewers look at first. |
| Screenshot 2 | 1280×800 | Recommended | The toolbar popup open over a real article, showing the current page's address, "Clean this page", "Paste text" and "Copy clean link". Crop tight so the 300px popup is legible; do not shrink it into a corner. |
| Screenshot 3 | 1280×800 | Recommended | The right-click menu open on a text selection with "Print just this selection" highlighted. |
| Screenshot 4 | 1280×800 | Optional | The printxpdf.com print preview / PDF export step, showing the cleaned article in a print dialog. |
| Small promo tile | 440×280 PNG or JPEG | Optional | The wordmark plus one line of value ("Print any article without the clutter"), on the brand blue `#2b5bff`. No screenshots-in-a-tile, no text smaller than ~18px. |
| Marquee promo tile | 1400×560 | Optional | Only needed if the item is ever considered for featuring. |
| YouTube video | link | Optional | Skip for v1. |

Rules that apply to all of them: no browser chrome that is not real, no mocked
UI that the extension does not actually produce, no text that promises a feature
the extension does not have, and no other company's trademarks. All five
screenshot slots take 1280×800; 640×400 is accepted but looks soft on modern
displays, so shoot at 1280×800.

---

## 5. Submission checklist for the human

1. **Developer account.** Register at
   <https://chrome.google.com/webstore/devconsole> with a Google account and pay
   the **one-time US$5 registration fee**. Turn on 2-Step Verification on that
   Google account first; the dashboard requires it.
2. **Verify the contact email** on the account (Account tab → contact email →
   verify). An unverified email blocks publishing.
3. **Build the package:** `node scripts/build-extension.mjs`, then upload
   `dist-extension/printxpdf-extension-v1.0.0.zip` via "Add new item".
4. **Publish the privacy policy page first** (see the warning in section 2) and
   check that <https://printxpdf.com/extension-privacy> returns 200 in a private
   window.
5. **Store listing tab:** paste section 1 of this file. Upload the icon and at
   least one screenshot from section 4.
6. **Privacy practices tab:** paste section 2, field by field. Tick the three
   certifications, answer every data category "No", paste the privacy policy URL.
7. **Distribution tab:** section 3.
8. **Submit for review.** Expect a few days; a permission-light extension with
   no host permissions and ~500 lines of readable, unminified code is at the
   fast end of the range. Once approved, the item must be published within
   **30 days** or the submission reverts to draft.
9. **Every later upload needs a new `version`** in `manifest.json`. The store
   rejects a repeat of a version it has already seen.

## 6. If a reviewer pushes back

- *"Please justify the `scripting` permission."* → It is used once, for the
  selection feature, with no content scripts. Point at `cleanSelection` in
  `background.js`.
- *"Your extension appears to collect user data."* → It makes no network
  requests at all. Point at the `audit()` step in `scripts/build-extension.mjs`,
  which fails the build on `fetch(`, `XMLHttpRequest`, `WebSocket`, `eval(`,
  `new Function(`, `importScripts(`, remote `<script src>` and remote
  stylesheets.
- *"Single purpose is unclear."* → Paste the single-purpose statement above.
  Every surface performs the same action.

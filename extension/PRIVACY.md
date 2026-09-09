# Privacy Policy — PrintxPDF Chrome extension

**Last updated: 10 September 2026**

> **Publish this text at <https://printxpdf.com/extension-privacy>.** The Chrome
> Web Store requires a privacy policy at a public URL for any extension that
> handles user data, and this file is not one. See `STORE_LISTING.md`.

## Summary

The PrintxPDF extension collects nothing, sends nothing anywhere, and has no
server of its own. There is no account, no analytics, no tracking, no
advertising and no third party of any kind.

## Who we are

PrintxPDF, <https://printxpdf.com>. Contact: the address published on that site.

## What the extension stores

Two values, both on your own machine, both created only by your own actions,
both deleted when you uninstall the extension:

| Key | Where | What it is |
| --- | --- | --- |
| `openInNewTab` | `chrome.storage.sync` | The "Open in a new tab" checkbox, so the preference follows your Chrome profile. |
| `lastSelection` | `chrome.storage.local` | A timestamp and a "was the copy blocked?" flag from the last time you used "Print just this selection", so the popup can remind you to paste. **It never contains the selected text.** |

Neither value is transmitted anywhere. `chrome.storage.sync` is synchronised
between your own Chrome profiles by Google, under Google's own terms; we cannot
read it.

## What the extension reads

**The address of the tab you are on** — and only when you ask for it, by
clicking the toolbar icon, choosing a PrintxPDF context-menu item, or pressing
the keyboard shortcut. That is what the `activeTab` permission means: access to
one tab, granted by your gesture, gone when you navigate away. The extension
holds no standing permission for any website, which is why Chrome never asks you
to let it "read and change all your data on all websites".

**The text you selected**, and only for the "Print just this selection"
context-menu item, and only on the page where you selected it. The selection is
turned into HTML and placed on your system clipboard. It goes to your clipboard
and nowhere else — not to us, not to any server.

The extension does not read your browsing history, your bookmarks, your
passwords, your cookies, your form input, your location or your identity, and it
has no code capable of doing so.

## What the extension sends

**Nothing.** The extension makes no network requests. It contains no analytics,
no trackers, no remote code, no third-party libraries and no code fetched at
runtime; every line that runs is in the package you installed.

When you press a button, the extension opens a normal browser tab at
`https://printxpdf.com/print?url=…`. That is an ordinary page visit that you can
see in your address bar and cancel like any other — your browser requests that
page exactly as it would if you typed the address. printxpdf.com then fetches
and cleans the article **in your browser**; no document is uploaded to a server,
and printxpdf.com's own privacy policy governs that page visit.

## Sale and sharing of data

We do not collect user data, so there is nothing to sell, share, transfer or
disclose. We do not sell or transfer user data to third parties, we do not use
or transfer user data for purposes unrelated to the extension's single purpose,
and we do not use or transfer user data to determine creditworthiness or for
lending purposes. This is the Chrome Web Store's Limited Use commitment, and the
extension meets it by holding no user data at all.

## Children

The extension is a printing tool for general audiences. It collects no data from
anyone, children included.

## Removing your data

Uninstalling the extension deletes both stored values. You can also remove it
from `chrome://extensions`, or simply untick the checkbox in the popup to reset
the preference.

## Changes to this policy

If the extension's data practices ever change, this policy will be updated
before the change ships, and the Chrome Web Store listing's privacy disclosures
will be updated in the same release.

## Contact

Questions about this policy: <https://printxpdf.com>

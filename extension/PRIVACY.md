# Privacy — PrintxPDF Chrome extension

Short version: the extension collects nothing, sends nothing anywhere, and has
no server of its own.

## What it stores

Two things, both on your machine, both removed when you uninstall:

- `openInNewTab` — the "Open in a new tab" checkbox, in `chrome.storage.sync`,
  so the preference follows your Chrome profile.
- `lastSelection` — a timestamp and a "was the copy blocked?" flag from the last
  time you used "Print just this selection", in `chrome.storage.local`, so the
  popup can remind you to paste. It never contains the selected text.

## What it reads

The URL of the tab you are on — and only when you ask, by clicking the toolbar
icon, choosing a context-menu item, or pressing the keyboard shortcut. That is
what the `activeTab` permission means: access to one tab, granted by your
gesture, gone when you navigate away. The extension holds no standing permission
for any site, which is why it never asks to "read and change all your data on
all websites".

For "Print just this selection" it also reads the text you selected, on that
page, to put it on your clipboard. The selection goes to your clipboard and
nowhere else.

## What it sends

Nothing. The extension makes no network requests, contains no analytics, no
trackers, no remote code and no third-party libraries.

Clicking a button opens a tab at `https://printxpdf.com/print?url=…`. That is a
normal page visit you can see in the address bar: your browser requests that page
the same way it would if you typed the address. printxpdf.com cleans the page in
your browser — the article is fetched and processed client-side, and no document
is uploaded to a server.

## Removing your data

Uninstalling the extension deletes both stored values. You can also clear them
from `chrome://extensions` → PrintxPDF → remove, or reset the checkbox in the
popup at any time.

Questions: <https://printxpdf.com>

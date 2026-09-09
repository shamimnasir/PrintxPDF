=== PrintxPDF Print & PDF Button ===
Contributors: nasiruddinshamim
Tags: print, pdf, print button, printer friendly, save as pdf
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Add a Print, Save as PDF and Email button to your posts and pages. Free, no account, no API key, and the plugin makes no outbound requests.

== Description ==

PrintxPDF adds a small row of buttons to your posts and pages so readers can print a clean copy, save a PDF, or mail themselves the link.

* **Print** opens the browser's own print dialog immediately. No network request, no waiting.
* **Save as PDF** opens printxpdf.com/print in a new tab with the post URL. There the reader gets a decluttered version of the page, an editor, and Print, PDF, PNG and Email outputs. That processing happens in the reader's browser.
* **Email** opens the reader's own mail app with the post title and link already filled in. Your site sends nothing.

Everything is free. There is no Pro version, no licence key, no locked feature and no upsell inside the plugin.

= Privacy =

The plugin makes no outbound HTTP requests of any kind. It does not phone home, does not register users, does not set cookies and does not add any tracking. It stores exactly one option in your database and deletes it when you uninstall.

The Save as PDF button is an ordinary link the reader chooses to click. Nothing is sent to printxpdf.com unless a reader clicks it.

= Lightweight by design =

One PHP file, one small stylesheet and about fifteen lines of inline JavaScript. No jQuery, no framework, no bundled build output, no Composer, no database tables and no cron jobs. Assets load only on the pages that actually render a button.

= Where the buttons appear =

Choose above the content, below the content, both, or manual only. Pick which public post types get them. Or place them yourself:

`[printxpdf]`

`[printxpdf buttons="print,pdf" label="Print this page" align="center"]`

The shortcode works in the Classic editor, in the Gutenberg Shortcode block, and in most page builders. There is also a **PrintxPDF Buttons** block in the block inserter.

== Installation ==

1. Upload the `printxpdf` folder to `/wp-content/plugins/`, or install the zip from Plugins > Add New > Upload Plugin.
2. Activate the plugin through the Plugins screen.
3. Go to Settings > PrintxPDF to choose the placement, the buttons and the post types.

Sensible defaults are set on activation: a Print and a Save as PDF button, below the content, on posts and pages.

== Frequently Asked Questions ==

= Is any part of this paid? =

No. Every button works for every visitor with no account and no key. PrintxPDF's own plans are listed on printxpdf.com for reference, but nothing in this plugin is gated behind them.

= Does the plugin send my content anywhere? =

No. The plugin performs no outbound HTTP requests. The Save as PDF button is a link a reader may choose to click, which opens printxpdf.com in their own browser tab with the public URL of the post.

= Will the buttons print themselves? =

No. The button row is hidden by a `@media print` rule, so it never appears on paper or in a saved PDF.

= The buttons do not match my theme =

Tick "Match my theme" in Settings > PrintxPDF. The plugin then only lays the buttons out and leaves every colour, border and font to your theme. The classes are `printxpdf-btn`, `printxpdf-btn-print`, `printxpdf-btn-pdf` and `printxpdf-btn-email`.

= What does "match my theme" turn off? =

Two things: the plugin's own button styling, and a short print stylesheet that hides `.site-header`, `.site-footer`, `.widget-area`, `#comments` and `nav` when the page is printed.

= The Print button does nothing =

It calls `window.print()`, which needs JavaScript. If a caching or optimisation plugin is stripping inline scripts, allow the `printxpdf` handle.

= Can I put the buttons somewhere my theme controls? =

Yes. Set the placement to "Manual only" and call `echo do_shortcode( '[printxpdf]' );` from your theme template, inside the loop.

= Does it work on custom post types? =

Yes. Every public post type appears as a checkbox on the settings screen.

== Screenshots ==

1. The button row below a post, using the plugin's own minimal styling.
2. Settings > PrintxPDF, with placement, buttons, post types and alignment.

Screenshot images are supplied with the WordPress.org listing rather than inside the plugin zip.

== Changelog ==

= 1.0.0 =
* First release.
* Print, Save as PDF and Email buttons.
* Settings screen: placement, which buttons, print button label, post types, alignment and a match-my-theme toggle.
* `[printxpdf]` shortcode and a server rendered `printxpdf/button` block.
* Print stylesheet that hides the button row and the common theme chrome.
* Uninstall removes the plugin's single option.

== Upgrade Notice ==

= 1.0.0 =
First release.

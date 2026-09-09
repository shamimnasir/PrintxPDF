=== PrintxPDF Print & PDF Button ===
Contributors: affglad
Tags: print, pdf, print button, printer friendly, email
Requires at least: 6.0
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Add a Print, Save as PDF and Email button to your posts and pages. Free, no account and no API key.

== Description ==

PrintxPDF adds a small row of buttons to your posts and pages so readers can print a clean copy, save a PDF, or mail themselves the link.

* **Print** calls the browser's own print dialog. Nothing leaves the page.
* **Save as PDF** is a link to the printxpdf.com web service, where the reader gets a decluttered version of the page they can edit and export. See "External service" below.
* **Email** opens the reader's own mail app with the post title and link already filled in. Your site sends nothing.

Everything is free. There is no Pro version, no licence key, no locked feature, no trial and no quota.

= External service: printxpdf.com =

**What the service is.** The "Save as PDF" button is an ordinary HTML link pointing at `https://printxpdf.com/print`, a third-party web service operated by the author of this plugin. That service is what turns a web page into a PDF; this plugin does not generate PDFs itself. It is a free service and needs no account, registration or API key, for you or for your readers.

**When data is transmitted.** Never by the plugin. The plugin makes no outbound HTTP request of any kind, on the front end or in the admin, on activation or on any schedule. Data reaches printxpdf.com only at the moment a reader chooses to click the "Save as PDF" button, at which point the reader's own browser navigates to the service in a new tab.

**What is transmitted.** The public permalink of the post, passed in the query string as `?url=<permalink>`, plus whatever the reader's browser normally sends with any navigation: IP address, user agent and referrer. That is all. No post content, no page HTML, no site credentials, no administrator details, no visitor records and no information about your WordPress installation are sent by this plugin.

**Terms and privacy policy.** Service terms of use: [https://printxpdf.com/terms](https://printxpdf.com/terms). Service privacy policy: [https://printxpdf.com/privacy](https://printxpdf.com/privacy).

**Turning it off.** If you would rather send nobody to the service, untick "Save as PDF" in Settings > PrintxPDF. The Print and Email buttons then run entirely on the reader's own device and no third-party service is involved at all.

This disclosure is repeated on the plugin's own settings screen.

= Privacy =

The plugin does not phone home, does not register users, does not set cookies, adds no tracking and creates no database tables. It stores exactly one option and deletes it when you uninstall.

= Lightweight by design =

One PHP file, one small stylesheet and about twenty lines of JavaScript whose only job is to call `window.print()`. No jQuery, no framework, no bundled build output, no Composer, no cron jobs. Assets load only on the pages that actually render a button.

= Where the buttons appear =

Choose above the content, below the content, both, or manual only. Pick which public post types get them. Or place them yourself:

`[printxpdf]`

`[printxpdf buttons="print,pdf" label="Print this page" align="center"]`

The shortcode works in the Classic editor, in the block editor's Shortcode block, and in most page builders.

== Installation ==

1. Upload the `printxpdf` folder to `/wp-content/plugins/`, or install the zip from Plugins > Add New > Upload Plugin.
2. Activate the plugin through the Plugins screen.
3. Go to Settings > PrintxPDF to choose the placement, the buttons and the post types.

Sensible defaults are set on activation: a Print and a Save as PDF button, below the content, on posts and pages.

== Frequently Asked Questions ==

= Does the plugin send my content anywhere? =

No. The plugin performs no outbound HTTP requests at all. The only third party involved is printxpdf.com, and only when a reader clicks "Save as PDF", which navigates their own browser to that service with the public URL of the post. The full disclosure, including links to the service's terms and privacy policy, is in the Description above and on the settings screen.

= Can I use the plugin without the third-party service? =

Yes. Untick "Save as PDF" in Settings > PrintxPDF. The Print and Email buttons involve no external service whatsoever.

= Is any part of this paid? =

No. Every button works for every visitor with no account and no key. Nothing in this plugin is gated, time-limited or quota-limited.

= How do I add the buttons in the block editor? =

Insert a Shortcode block and put `[printxpdf]` in it. This release ships no custom block of its own.

= Will the buttons print themselves? =

No. The button row is hidden by a `@media print` rule, so it never appears on paper or in a saved PDF.

= The buttons do not match my theme =

Tick "Match my theme" in Settings > PrintxPDF. The plugin then only lays the buttons out and leaves every colour, border and font to your theme. The classes are `printxpdf-btn`, `printxpdf-btn-print`, `printxpdf-btn-pdf` and `printxpdf-btn-email`.

= What does "match my theme" turn off? =

Two things: the plugin's own button styling, and a short print stylesheet that hides `.site-header`, `.site-footer`, `.widget-area`, `#comments` and `nav` when the page is printed.

= The Print button does nothing =

It calls `window.print()`, which needs JavaScript. If an optimisation plugin is deferring or blocking scripts, allow the `printxpdf` handle.

= Can I put the buttons somewhere my theme controls? =

Yes. Set the placement to "Manual only" and call `echo do_shortcode( '[printxpdf]' );` from your theme template, inside the loop.

= Does it work on custom post types? =

Yes. Every public post type appears as a checkbox on the settings screen.

== Screenshots ==

1. The button row below a post, using the plugin's own minimal styling.
2. Settings > PrintxPDF, with placement, buttons, post types and alignment.
3. The external service disclosure on the settings screen.

== Changelog ==

= 1.0.0 =
* First release.
* Print, Save as PDF and Email buttons.
* Settings screen: placement, which buttons, print button label, post types, alignment and a match-my-theme toggle.
* `[printxpdf]` shortcode.
* Print stylesheet that hides the button row and the common theme chrome.
* Uninstall removes the plugin's single option.

== Upgrade Notice ==

= 1.0.0 =
First release.

# Submitting PrintxPDF to the WordPress.org plugin directory

**Status: SUBMITTED, review in progress.** WordPress.org account `affglad` has an
active pending review for this plugin. The corrected package and directory assets
are ready for the next review round.

`node scripts/build-wp-plugin.mjs` builds the review package at
`dist-wp/printxpdf-wordpress-plugin-v1.0.0.zip` and copies the website download.

---

## Ownership verification requested by the reviewer

`wordpress-plugin/printxpdf/readme.txt` reads:

```
Contributors: affglad
```

`affglad` is the WordPress.org username used for the pending submission.

The reviewer asked for the exact DNS TXT value `wordpressorg-affglad-verification`
at the root of `printxpdf.com`, or an equivalent domain-email ownership proof.

## Directory artwork

These images live in the SVN `assets/` directory, **not** inside the plugin ZIP.
The prepared assets are in this repository's `wordpress-plugin/assets/` directory.

| File | Size | Notes |
| --- | --- | --- |
| `icon-128x128.png` | 128 × 128 | Shown in search results and the plugin installer. |
| `icon-256x256.png` | 256 × 256 | Retina variant. Same artwork, same crop. |
| `banner-772x250.png` | 772 × 250 | Header on the plugin page. |
| `banner-1544x500.png` | 1544 × 500 | Retina variant. |

`.jpg` is accepted for banners; `icon.svg` is accepted in place of the two PNGs.
Artwork must be family friendly and must not use anyone else's trademarks or logos.

## Directory screenshots

`readme.txt` declares three screenshots. Each numbered item must have a matching
image file in the SVN `assets/` directory or the listing shows a broken image.

| Caption in `== Screenshots ==` | Required file |
| --- | --- |
| 1. The button row below a post, using the plugin's own minimal styling. | `screenshot-1.png` |
| 2. Settings > PrintxPDF, with placement, buttons, post types and alignment. | `screenshot-2.png` |
| 3. The external service disclosure on the settings screen. | `screenshot-3.png` |

These were captured from a real WordPress Playground install with the plugin active.

## Also verify before submitting

- **`Tested up to: 7.1`** — this was set to the current WordPress release. Actually
  install and exercise the plugin on WordPress 7.1 before you submit. Never set this
  above the current stable release (or current RC, if one exists).
  <https://developer.wordpress.org/plugins/wordpress-org/plugin-developer-faq/>
- **Run Plugin Check.** Install the official
  [Plugin Check (PCP)](https://wordpress.org/plugins/plugin-check/) plugin on a test
  site, run it against PrintxPDF, and clear anything it reports. The review team runs
  it. This repository's linter approximates PCP but is not a substitute for it.
- **Run with `WP_DEBUG` and `WP_DEBUG_LOG` on.** The review checklist requires zero
  PHP notices and zero JS console errors.
- **Validate the readme** at <https://wordpress.org/plugins/developers/readme-validator/>.
- **Confirm the service pages are live**: <https://printxpdf.com/terms> and
  <https://printxpdf.com/privacy> must resolve, because `readme.txt` and the settings
  screen both link to them as the external-service disclosure. If either 404s at
  review time, the submission is rejected under the serviceware requirements.

---

## Step 1 — build the submission ZIP

```sh
node scripts/build-wp-plugin.mjs        # must exit 0, with no --draft
```

Produces:

- `dist-wp/printxpdf-wordpress-plugin-v1.0.0.zip` — the file you upload
- `public/downloads/printxpdf-wordpress-plugin.zip` — copy for the website

The archive contains exactly one top-level directory, `printxpdf/`. Confirm with
`unzip -l dist-wp/printxpdf-wordpress-plugin-v1.0.0.zip`.

Do **not** put icons, banners or screenshots in this ZIP. They go in SVN `assets/`.

## Step 2 — submit for review

1. Go to <https://wordpress.org/plugins/developers/add/> while signed in.
2. Upload the ZIP. The uploader runs an automated check immediately and will reject
   obvious problems (bad readme, duplicate slug, missing headers) before a human sees it.
3. The requested slug is derived from `Plugin Name:` in the main file. Ours resolves to
   `printxpdf`. Confirm the slug shown on the confirmation screen is `printxpdf` — if
   it is anything else, the text domain, `languages/printxpdf.pot`, option prefix and
   directory name all assume `printxpdf` and would need changing.

**Naming / trademark note (Guideline 17).** "PrintxPDF" is our own brand and the slug
begins with it, which is exactly what the guideline requires: a slug may not *begin*
with someone else's trademark. "PDF" is a generic file format, not a protected mark in
this context, and it does not lead the slug. If the automated check ever objects to a
term in the display name, the fix is to edit `Plugin Name:` in **both**
`printxpdf/printxpdf.php` and the `=== ... ===` line of `readme.txt` so they match.
<https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/>

## Step 3 — wait for the review

- An automated confirmation email arrives at once. That is **not** approval.
- A human review follows. Expect days to several weeks; the queue length varies and
  no SLA is published.
- The team emails findings from Help Scout. Reply **to that email thread** with a
  fixed ZIP attached — do not resubmit through the form, and do not open a second
  submission. Each round trip restarts the wait.
- Approval mail contains your SVN URL:
  `https://plugins.svn.wordpress.org/printxpdf/`
  Nothing is public until you commit code to SVN.

## Step 4 — first SVN commit

```sh
svn checkout https://plugins.svn.wordpress.org/printxpdf/ printxpdf-svn
cd printxpdf-svn
```

The checkout has three top-level directories:

```
printxpdf-svn/
  trunk/     <- the plugin's current source
  tags/      <- one immutable directory per released version
  branches/  <- unused for this plugin
  assets/    <- icons, banners, screenshots (created by you; NOT in the ZIP)
```

Populate them:

```sh
# 1. trunk = the contents of wordpress-plugin/printxpdf/ (not the folder itself)
rsync -a --delete ../wordpress-plugin/printxpdf/ trunk/

# 2. assets = the artwork from Blockers 2 and 3
mkdir -p assets
cp /path/to/icon-128x128.png   assets/
cp /path/to/icon-256x256.png   assets/
cp /path/to/banner-772x250.png assets/
cp /path/to/banner-1544x500.png assets/
cp /path/to/screenshot-1.png   assets/
cp /path/to/screenshot-2.png   assets/
cp /path/to/screenshot-3.png   assets/

svn add --force trunk assets
svn commit -m "Initial release: PrintxPDF 1.0.0"
```

Then tag the release. The tag is what users actually install, because `Stable tag`
in `trunk/readme.txt` points at it:

```sh
svn copy trunk tags/1.0.0
svn commit -m "Tag 1.0.0"
```

`Stable tag: 1.0.0` must appear in **both** `trunk/readme.txt` and
`tags/1.0.0/readme.txt`, and must equal `Version: 1.0.0` in `printxpdf.php`.
The build linter enforces the version/stable-tag match; keeping the tagged copy in
sync is on you. <https://developer.wordpress.org/plugins/wordpress-org/how-your-readme-txt-works/>

The directory rebuilds within ~15 minutes of a commit.

## Releasing later versions

1. Bump `Version:` in `printxpdf.php` **and** `Stable tag:` in `readme.txt` together.
2. Add a `== Changelog ==` entry and an `== Upgrade Notice ==` entry.
3. `node scripts/build-wp-plugin.mjs` — it fails if the two versions disagree.
4. `rsync` into `trunk/`, commit, then `svn copy trunk tags/<version>` and commit.

Commit releases, not work in progress: Guideline 14 asks you not to use SVN as a
development repository. Readme-only and artwork-only changes do not need a version bump.

---

## What an agent could not verify

These need a running WordPress install and are unverified as of this writing:

- The settings screen rendering inside real `wp-admin` styling.
- `the_content` placement against a real theme, and the print stylesheet's effect on
  real theme chrome.
- Behaviour under `WP_DEBUG` on WordPress 7.1.
- The output of the official Plugin Check plugin.
- Multisite activation and the per-site uninstall loop in `uninstall.php`.
- Interaction with caching and script-optimisation plugins.

## Decisions a human still owns

- The WordPress.org username, and whether to list more than one contributor.
- Whether to add a `Donate link:` header (currently absent, deliberately).
- Whether to add a custom Gutenberg block in a later version. 1.0.0 deliberately ships
  none: an earlier draft registered one from an inline `wp.*` script that nobody could
  test in a real editor, which risks exactly the JS errors the review checklist
  prohibits. The Shortcode block covers the block editor today, and the FAQ says so.
  If a block is added later it should use a real `block.json` with an enqueued
  `editorScript`, and it must be exercised in a live editor before release.
- Whether `Requires at least: 6.0` is still the floor you want to support.

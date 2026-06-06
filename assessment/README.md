# DSOVS web app

A small, dependency-free web app for the OWASP DevSecOps Verification Standard
(DSOVS): a landing page, a browser-based self-assessment, and a rendered page
for every control.

- **Runs in the browser, no backend.** Assessment answers and screenshots are
  stored on the user's own device (`localStorage` + IndexedDB) and never leave it.
- **No content drift.** Every page is generated from the same source of truth
  (`data/controls/*.yaml` -> `assessment/data.js`), so the rendered controls, the
  self-assessment and the JSON API always agree.

## Pages

| File | Purpose |
| ---- | ------- |
| `index.html` | Landing page (overview, use cases, the table of contents) |
| `assess.html` | Self-assessment tool and report |
| `control.html?code=CODE-001` | A single control, rendered in this design |
| `data.js` | **Generated** - `window.DSOVS_DATA`, the full control set |
| `styles.css` | Shared design tokens, top bar, buttons |
| `home.css` / `control.css` | Landing / control-page layout |
| `app.js` / `home.js` / `control.js` | Behaviour for each page |

## Using it

Open the published site, or open `index.html` locally in a browser.

## Regenerating data

`data.js` is produced from the source of truth by `scripts/generate_json.py`,
which also writes the standalone JSON API to `dist/dsovs.json`. Do not edit
`data.js` by hand:

```bash
python scripts/generate_json.py
```

## Deploying (Cloudflare Pages)

The whole app is static, so it deploys to any static host. For Cloudflare Pages
with Wrangler (needs Node 20+ and `wrangler login` first):

```bash
wrangler pages deploy assessment --project-name dsovs
```

Then attach the custom domain in the Cloudflare dashboard. No secrets are stored
in this repository.

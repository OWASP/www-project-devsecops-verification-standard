# DSOVS Self-Assessment Tool

A small, dependency-free web app for assessing a project or organisation against
the OWASP DevSecOps Verification Standard (DSOVS).

- **Runs in the browser, no backend.** Answers are stored in `localStorage` on the
  user's own device and never leave it.
- **Generates a report** — overall maturity, a per-phase breakdown, and a
  prioritised list of gaps with the concrete next step (and verification
  evidence) required to reach the target level.
- **Exports** to JSON, or prints to PDF.

## Using it

Open the published page at `…/assessment/` on the project site, or open
`assessment/index.html` locally in a browser.

## How it is built

The tool is plain HTML, CSS and JavaScript:

| File | Purpose |
| ---- | ------- |
| `index.html` | Page shell |
| `styles.css` | Styling |
| `app.js` | Assessment logic, persistence and report generation |
| `data.js` | **Generated** — `window.DSOVS_DATA`, the full control set |

`data.js` is produced from the source of truth (`data/controls/*.yaml`) by
`scripts/generate_json.py`, which also writes the standalone JSON API to
`dist/dsovs.json`. Do not edit `data.js` by hand — regenerate it:

```bash
python scripts/generate_json.py
```

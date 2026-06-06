#!/usr/bin/env python3
"""Generate the DSOVS JSON API and the assessment tool's data bundle.

Reads the machine-readable source of truth (``data/controls/*.yaml``) and the
``VERSION`` file, then writes two deterministic artefacts:

* ``dist/dsovs.json``      - the full machine-readable API (consumed by tooling)
* ``assessment/data.js``   - the same payload as ``window.DSOVS_DATA`` so the
                             browser-based self-assessment works with no backend
                             and no fetch (also fine to open from ``file://``).

Both outputs are byte-stable for identical input so CI can assert they are up to
date with ``git diff --exit-code``.
"""

import json
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parent.parent
CONTROLS_DIR = REPO / "data" / "controls"
DIST_DIR = REPO / "dist"
ASSESSMENT_DIR = REPO / "assessment"
VERSION_FILE = REPO / "VERSION"

REPO_SLUG = "OWASP/www-project-devsecops-verification-standard"
DOC_BASE = f"https://github.com/{REPO_SLUG}/blob/main/document"
SITE = "https://dsovs.com"
REPO_URL = f"https://github.com/{REPO_SLUG}"
LEVEL_NAMES = ["Initial", "Basic", "Managed", "Optimised"]

# Semantic SDLC phases in canonical order.
PHASES = [
    "Organisation",
    "Requirements",
    "Design",
    "Code/Build",
    "Test",
    "Release/Deploy",
    "Operate/Monitor",
]
PHASE_ORDER = {name: i for i, name in enumerate(PHASES)}


def read_version() -> str:
    if VERSION_FILE.exists():
        return VERSION_FILE.read_text(encoding="utf-8").strip()
    return "0.0.0"


def load_controls():
    controls = []
    for path in sorted(CONTROLS_DIR.glob("*.yaml")):
        with path.open(encoding="utf-8") as fh:
            controls.append(yaml.safe_load(fh))
    controls.sort(key=lambda c: (PHASE_ORDER.get(c["phase"], 99), c["code"]))
    return controls


def build_control(raw):
    """Project a raw YAML control into the public API shape (stable field order)."""
    control = {
        "id": raw["id"],
        "code": raw["code"],
        "title": raw["title"],
        "phase": raw["phase"],
        "slug": raw["slug"],
        "status": raw["status"],
        "type": raw["type"],
        "summary": raw["summary"].strip(),
        "doc_url": f"{DOC_BASE}/{raw['slug']}.md",
        "levels": [],
    }

    for lvl in raw["levels"]:
        entry = {
            "level": lvl["level"],
            "title": lvl["title"].strip(),
            "description": lvl["description"].strip(),
            "evidence": list(lvl.get("evidence") or []),
        }
        diagram = lvl.get("diagram")
        if diagram:
            entry["diagram"] = diagram.strip()
        control["levels"].append(entry)

    if raw.get("tools"):
        control["tools"] = []
        for tool in raw["tools"]:
            out = {
                "name": tool["name"],
                "url": tool["url"],
                "description": tool["description"].strip(),
            }
            if tool.get("integrations"):
                out["integrations"] = [
                    {
                        "platform": ig["platform"],
                        "label": ig.get("label"),
                        "link": ig.get("link"),
                        "code": ig["code"].rstrip("\n"),
                    }
                    for ig in tool["integrations"]
                ]
            control["tools"].append(out)

    if raw.get("further_reading"):
        control["further_reading"] = [
            {"url": fr["url"], "note": fr.get("note", "")}
            for fr in raw["further_reading"]
        ]

    if raw.get("mappings"):
        mappings = {k: list(v) for k, v in raw["mappings"].items() if v}
        if mappings:
            control["mappings"] = mappings

    if raw.get("credits"):
        control["credits"] = [
            {"name": c["name"], "url": c.get("url")} for c in raw["credits"]
        ]

    return control


def build_payload():
    controls = [build_control(c) for c in load_controls()]
    present_phases = [p for p in PHASES if any(c["phase"] == p for c in controls)]
    return {
        "standard": "OWASP DevSecOps Verification Standard",
        "abbreviation": "DSOVS",
        "version": read_version(),
        "source": "data/controls/*.yaml",
        "generator": "scripts/generate_json.py",
        "phases": present_phases,
        "control_count": len(controls),
        "controls": controls,
    }


def _controls_by_phase(payload):
    groups = []
    for phase in payload["phases"]:
        items = [c for c in payload["controls"] if c["phase"] == phase]
        if items:
            groups.append((phase, items))
    return groups


def build_llms_index(payload):
    """The /llms.txt index: a short, link-first map for LLMs and agents."""
    n, phases = payload["control_count"], len(payload["phases"])
    out = []
    out.append("# OWASP DevSecOps Verification Standard (DSOVS)")
    out.append("")
    out.append(
        f"> An open framework for measuring security maturity across the whole software "
        f"development lifecycle. {n} controls across {phases} phases, each rated on four "
        f"maturity levels (0-3) with the verification evidence an assessor would check."
    )
    out.append("")
    out.append(
        "DSOVS is used for gap analysis, building a security maturity roadmap, and assessing "
        "third-party SDLC maturity. The whole standard is generated from a single machine-readable "
        "source of truth, so the documentation, the JSON API and the self-assessment tool never "
        "drift apart."
    )
    out.append("")
    out.append("## For agents")
    out.append("")
    out.append(
        f"- [DSOVS JSON API]({SITE}/dsovs.json): the complete standard as structured JSON. Each "
        "control has its phase, type, summary, four maturity levels (with descriptions and "
        "verification evidence), notable tools with CI examples, and framework mappings. Start here "
        "for programmatic use."
    )
    out.append(f"- [Full standard as Markdown]({SITE}/llms-full.txt): every control inlined for a single fetch.")
    out.append(
        f"- To assess a target, infer a level (0-3) per control from its code, CI config and "
        f"practices, then emit the same shape the [self-assessment tool]({SITE}/assess) exports: "
        "id, code, title, phase, level, notes."
    )
    out.append("")
    for phase, items in _controls_by_phase(payload):
        out.append(f"## {phase}")
        out.append("")
        for c in items:
            out.append(f"- [{c['code']} {c['title']}]({c['doc_url']}): {c['type']} control")
        out.append("")
    out.append("## Resources")
    out.append("")
    out.append(f"- [Self-assessment tool]({SITE}/assess): rate maturity in the browser and generate a report; runs entirely client-side")
    out.append(f"- [Project on GitHub]({REPO_URL})")
    out.append("")
    out.append("## Optional")
    out.append("")
    out.append(f"- [Landing page]({SITE}/)")
    out.append("")
    return "\n".join(out)


def build_llms_full(payload):
    """The /llms-full.txt file: the entire standard inlined as readable Markdown."""
    out = []
    out.append("# OWASP DevSecOps Verification Standard - Full Reference")
    out.append("")
    out.append(
        f"> The complete DSOVS standard ({payload['control_count']} controls across "
        f"{len(payload['phases'])} lifecycle phases) inlined as Markdown. Generated from "
        f"data/controls/*.yaml (v{payload['version']}). Structured JSON: {SITE}/dsovs.json"
    )
    out.append("")
    out.append("## Maturity levels")
    out.append("")
    out.append("- Level 0 (Initial): the control is absent.")
    out.append("- Level 1 (Basic): performed manually or on demand.")
    out.append("- Level 2 (Managed): automated and integrated into the pipeline.")
    out.append("- Level 3 (Optimised): centrally tracked, measured and continuously improved.")
    out.append("")
    for phase, items in _controls_by_phase(payload):
        out.append(f"# {phase} phase")
        out.append("")
        for c in items:
            out.append(f"## {c['code']} {c['title']}")
            out.append("")
            out.append(f"- ID: {c['id']}")
            out.append(f"- Type: {c['type']}")
            out.append(f"- Source: {c['doc_url']}")
            out.append("")
            out.append(c["summary"])
            out.append("")
            for lvl in c["levels"]:
                name = LEVEL_NAMES[lvl["level"]] if lvl["level"] < len(LEVEL_NAMES) else ""
                out.append(f"### Level {lvl['level']} ({name}) - {lvl['title']}")
                out.append("")
                out.append(lvl["description"])
                out.append("")
                if lvl.get("evidence"):
                    out.append("Verification evidence:")
                    for e in lvl["evidence"]:
                        out.append(f"- {e}")
                    out.append("")
            if c.get("tools"):
                names = ", ".join(f"{t['name']} ({t['url']})" for t in c["tools"])
                out.append(f"Notable tools: {names}")
                out.append("")
            if c.get("mappings"):
                parts = []
                for k, vals in c["mappings"].items():
                    if vals:
                        parts.append(f"{k}: {', '.join(vals)}")
                if parts:
                    out.append("Framework mappings: " + "; ".join(parts))
                    out.append("")
            if c.get("further_reading"):
                out.append("Further reading:")
                for r in c["further_reading"]:
                    note = (r.get("note") or "").strip()
                    out.append(f"- {r['url']}" + (f" - {note}" if note else ""))
                out.append("")
    return "\n".join(out)


def main():
    if not CONTROLS_DIR.exists():
        print(f"error: {CONTROLS_DIR} not found", file=sys.stderr)
        return 1

    payload = build_payload()
    pretty = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    ASSESSMENT_DIR.mkdir(parents=True, exist_ok=True)

    (DIST_DIR / "dsovs.json").write_text(pretty, encoding="utf-8")
    # also serve the JSON API from the site root
    (ASSESSMENT_DIR / "dsovs.json").write_text(pretty, encoding="utf-8")

    banner = (
        "// Generated by scripts/generate_json.py - do not edit by hand.\n"
        "// Source of truth: data/controls/*.yaml\n"
    )
    data_js = banner + "window.DSOVS_DATA = " + pretty.rstrip("\n") + ";\n"
    (ASSESSMENT_DIR / "data.js").write_text(data_js, encoding="utf-8")

    # llms.txt + llms-full.txt, served from the site root and the repo root
    llms_index = build_llms_index(payload)
    llms_full = build_llms_full(payload)
    for base in (ASSESSMENT_DIR, REPO):
        (base / "llms.txt").write_text(llms_index, encoding="utf-8")
        (base / "llms-full.txt").write_text(llms_full, encoding="utf-8")

    print(
        f"Wrote dist/dsovs.json, assessment/{{data.js,dsovs.json}}, and "
        f"llms.txt + llms-full.txt (site + repo root) "
        f"({payload['control_count']} controls, v{payload['version']})."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

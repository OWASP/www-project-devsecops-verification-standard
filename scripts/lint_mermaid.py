#!/usr/bin/env python3
"""Lint Mermaid diagrams embedded in the published DSOVS Markdown docs.

For each ```mermaid fenced block under document/*.md this checks:
  * the ``` code fences in the file are balanced;
  * each mermaid block's first non-empty line starts with 'graph ' or
    'flowchart ';
  * no '&' or '/' characters appear inside an edge label (the text between
    '--' and the closing '-->' or '--').

Reports file:line for any issue and exits 1 if any are found.
"""

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DOCUMENT_DIR = REPO_ROOT / "document"

FENCE_RE = re.compile(r"^\s*```")
# An edge label is the text between '--' and a closing '-->' or '--'.
# Examples: 'A-- label -->B', 'A--label --B', 'A-- ad-hoc review -->B'.
# The label may contain single hyphens but not the '--' terminator, and does
# not start with '>' (which would be the arrowhead of an empty edge).
EDGE_LABEL_RE = re.compile(r"--(?P<label>(?:(?!--)[^>])+?)--(?:>|(?!-))")


def find_mermaid_blocks(lines):
    """Yield (start_line, fence_label, [(line_no, text), ...]) for fenced blocks.

    Also returns whether fences are balanced.  Line numbers are 1-based.
    """
    blocks = []
    in_fence = False
    fence_label = None
    block_lines = []
    block_start = None

    for idx, raw in enumerate(lines, start=1):
        if FENCE_RE.match(raw):
            if not in_fence:
                in_fence = True
                fence_label = raw.strip().lstrip("`").strip().lower()
                block_lines = []
                block_start = idx
            else:
                if fence_label == "mermaid":
                    blocks.append((block_start, block_lines))
                in_fence = False
                fence_label = None
        elif in_fence:
            block_lines.append((idx, raw))

    balanced = not in_fence
    return blocks, balanced, block_start


def check_label_chars(line_no, text, rel, issues):
    for match in EDGE_LABEL_RE.finditer(text):
        label = match.group("label")
        for bad in ("&", "/"):
            if bad in label:
                issues.append(
                    "{}:{}: edge label '{}' contains forbidden character '{}'".format(
                        rel, line_no, label.strip(), bad
                    )
                )


def lint_file(path):
    issues = []
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        return ["{}: could not read file: {}".format(path, exc)]

    rel = path.relative_to(REPO_ROOT)
    blocks, balanced, open_start = find_mermaid_blocks(lines)

    if not balanced:
        issues.append(
            "{}:{}: unbalanced code fences (``` opened but never closed)".format(
                rel, open_start
            )
        )

    for start, block_lines in blocks:
        first = None
        for line_no, text in block_lines:
            if text.strip():
                first = (line_no, text.strip())
                break
        if first is None:
            issues.append(
                "{}:{}: mermaid block is empty".format(rel, start)
            )
            continue
        first_no, first_text = first
        if not (first_text.startswith("graph ") or first_text.startswith("flowchart ")):
            issues.append(
                "{}:{}: mermaid block must start with 'graph ' or 'flowchart ', "
                "got '{}'".format(rel, first_no, first_text)
            )

        for line_no, text in block_lines:
            check_label_chars(line_no, text, rel, issues)

    return issues


def main():
    if not DOCUMENT_DIR.is_dir():
        print("ERROR: document directory not found at {}".format(DOCUMENT_DIR))
        return 1

    md_files = sorted(p for p in DOCUMENT_DIR.glob("*.md") if p.is_file())
    if not md_files:
        print("ERROR: no Markdown files found under {}".format(DOCUMENT_DIR))
        return 1

    all_issues = []
    files_with_blocks = 0
    for path in md_files:
        issues = lint_file(path)
        # Count whether the file has any mermaid blocks for the summary.
        try:
            if "```mermaid" in path.read_text(encoding="utf-8"):
                files_with_blocks += 1
        except OSError:
            pass
        all_issues.extend(issues)

    if all_issues:
        for issue in all_issues:
            print("FAIL {}".format(issue))
        print("")
        print(
            "Mermaid lint FAILED: {} issue(s) across {} file(s).".format(
                len(all_issues), len(md_files)
            )
        )
        return 1

    print(
        "Mermaid lint passed: checked {} Markdown file(s) "
        "({} contain mermaid blocks).".format(len(md_files), files_with_blocks)
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())

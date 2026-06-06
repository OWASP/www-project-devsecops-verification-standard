#!/usr/bin/env python3
"""Validate every DSOVS control YAML against the JSON Schema plus cross-checks.

Runs offline using only pyyaml, jsonschema and the standard library.
Exits 0 when all existing control files are valid, 1 on any failure.
Warnings (e.g. tool controls with no tools, docs/YAML mismatch) do not fail
the build.
"""

import sys
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator

REPO_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = REPO_ROOT / "schema" / "control.schema.json"
CONTROLS_DIR = REPO_ROOT / "data" / "controls"
DOCUMENT_DIR = REPO_ROOT / "document"

EXPECTED_LEVELS = [0, 1, 2, 3]


def load_schema():
    with SCHEMA_PATH.open("r", encoding="utf-8") as fh:
        return yaml.safe_load(fh)


def load_yaml(path):
    """Load a single YAML file, returning (data, error_message)."""
    try:
        with path.open("r", encoding="utf-8") as fh:
            data = yaml.safe_load(fh)
    except yaml.YAMLError as exc:
        return None, "YAML parse error: {}".format(exc)
    except OSError as exc:
        return None, "could not read file: {}".format(exc)
    if data is None:
        return None, "file is empty"
    if not isinstance(data, dict):
        return None, "top-level YAML must be a mapping, got {}".format(type(data).__name__)
    return data, None


def cross_checks(path, data):
    """Return (errors, warnings) lists of human-readable strings."""
    errors = []
    warnings = []

    code = data.get("code")
    control_id = data.get("id")
    slug = data.get("slug")
    stem = path.stem

    if code is not None and stem != code:
        errors.append(
            "filename stem '{}' does not match code '{}'".format(stem, code)
        )

    if code is not None and control_id is not None:
        expected_id = "DSOVS-" + code
        if control_id != expected_id:
            errors.append(
                "id '{}' should be '{}' (DSOVS- + code)".format(control_id, expected_id)
            )

    if code is not None and slug is not None:
        prefix = code + "-"
        if not slug.startswith(prefix):
            errors.append(
                "slug '{}' should start with '{}'".format(slug, prefix)
            )

    levels = data.get("levels")
    if isinstance(levels, list):
        level_numbers = [
            lvl.get("level") for lvl in levels if isinstance(lvl, dict)
        ]
        if level_numbers != EXPECTED_LEVELS:
            errors.append(
                "levels must be exactly 0,1,2,3 in order, got {}".format(level_numbers)
            )

    if data.get("type") == "tool":
        tools = data.get("tools")
        if not tools:
            warnings.append(
                "type is 'tool' but no 'tools' entries are present"
            )

    return errors, warnings


def doc_stems():
    if not DOCUMENT_DIR.is_dir():
        return set()
    return {p.stem for p in DOCUMENT_DIR.glob("*.md")}


def doc_codes():
    """Map document stems to their control code prefix (e.g. CODE-008)."""
    codes = {}
    for stem in doc_stems():
        parts = stem.split("-")
        if len(parts) >= 2:
            codes[parts[0] + "-" + parts[1]] = stem
    return codes


def main():
    if not SCHEMA_PATH.is_file():
        print("ERROR: schema not found at {}".format(SCHEMA_PATH))
        return 1
    if not CONTROLS_DIR.is_dir():
        print("ERROR: controls directory not found at {}".format(CONTROLS_DIR))
        return 1

    schema = load_schema()
    validator = Draft202012Validator(schema)

    yaml_files = sorted(
        p for p in CONTROLS_DIR.glob("*.yaml") if p.is_file()
    )
    if not yaml_files:
        print("ERROR: no control YAML files found under {}".format(CONTROLS_DIR))
        return 1

    total_errors = 0
    total_warnings = 0
    valid_count = 0

    seen_ids = {}
    seen_codes = {}
    yaml_codes = set()

    for path in yaml_files:
        rel = path.relative_to(REPO_ROOT)
        data, load_err = load_yaml(path)
        if load_err is not None:
            print("FAIL {}: {}".format(rel, load_err))
            total_errors += 1
            continue

        file_errors = []

        # Schema validation.
        schema_errors = sorted(
            validator.iter_errors(data), key=lambda e: list(e.path)
        )
        for err in schema_errors:
            location = "/".join(str(p) for p in err.path) or "<root>"
            file_errors.append("schema: at '{}': {}".format(location, err.message))

        # Cross-checks.
        cc_errors, cc_warnings = cross_checks(path, data)
        file_errors.extend(cc_errors)

        # Track uniqueness.
        control_id = data.get("id")
        code = data.get("code")
        if isinstance(control_id, str):
            if control_id in seen_ids:
                file_errors.append(
                    "duplicate id '{}' (also in {})".format(
                        control_id, seen_ids[control_id]
                    )
                )
            else:
                seen_ids[control_id] = rel
        if isinstance(code, str):
            yaml_codes.add(code)
            if code in seen_codes:
                file_errors.append(
                    "duplicate code '{}' (also in {})".format(
                        code, seen_codes[code]
                    )
                )
            else:
                seen_codes[code] = rel

        if file_errors:
            print("FAIL {}".format(rel))
            for msg in file_errors:
                print("  - {}".format(msg))
            total_errors += len(file_errors)
        else:
            valid_count += 1

        for msg in cc_warnings:
            print("WARN {}: {}".format(rel, msg))
            total_warnings += 1

    # Docs <-> YAML cross-reference (warnings only).
    docs = doc_codes()
    doc_code_set = set(docs.keys())

    for code in sorted(yaml_codes - doc_code_set):
        print(
            "WARN: control '{}' has a YAML but no matching document/*.md".format(code)
        )
        total_warnings += 1
    for code in sorted(doc_code_set - yaml_codes):
        print(
            "WARN: document '{}' has no matching data/controls/*.yaml".format(
                docs[code]
            )
        )
        total_warnings += 1

    print("")
    print(
        "Checked {} control file(s): {} valid, {} with errors, {} warning(s).".format(
            len(yaml_files), valid_count, len(yaml_files) - valid_count, total_warnings
        )
    )

    if total_errors:
        print("Validation FAILED with {} error(s).".format(total_errors))
        return 1

    print("All {} control files valid".format(len(yaml_files)))
    return 0


if __name__ == "__main__":
    sys.exit(main())

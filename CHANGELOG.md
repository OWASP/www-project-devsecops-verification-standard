# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> Note: Control IDs (e.g. `DSOVS-CODE-008`) are stable identifiers. Once assigned
> they will **not** be renumbered, even if controls are reorganised, deprecated,
> or new controls are inserted between them.

## [Unreleased]

_No unreleased changes yet. See [1.2.0] for the latest release._

## [1.2.0] - 2026-06-06

### Added

- Real content for all DSOVS categories, replacing the previous placeholder text.
- Maturity-level Mermaid flow diagrams across every control.
- A machine-readable source of truth under `data/controls/*.yaml`, validated by a
  JSON Schema (`schema/control.schema.json`).
- Verification-evidence and framework-mapping fields for each control.
- A generated JSON API at `dist/dsovs.json`, produced from the YAML source.
- A browser-based self-assessment tool under `assessment/`.
- CI validation (schema validation, Mermaid lint, and link checking) plus release
  automation via GitHub Actions.

### Changed

- Table of Contents status markers updated to reflect completed content.

[Unreleased]: https://github.com/OWASP/www-project-devsecops-verification-standard/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/OWASP/www-project-devsecops-verification-standard/compare/v1.1.0...v1.2.0

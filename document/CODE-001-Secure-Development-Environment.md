# Secure Development Environment

| ID             |
| -------------- |
| DSOVS-CODE-001 |

## Summary

It is important for developers to use a secure development environment in order to ensure the integrity of their code and avoid the risk of source-code theft. 

By using an environment that is secure and isolated from other networks, developers can be sure that their code remains safe and secure. 

Additionally, as development environments can be monitored and audited, it can help identify any potential vulnerabilities or malicious activity. 

This provides an extra level of security, as developers can be sure that no one is accessing their code without permission. 

Using a secure development environment also helps to reduce the risk of source-code theft, as the code is stored in a secure location and is not accessible to anyone outside of the development team.

## Level 0 - No security hardening standards for development environments

At this level of maturity there are no defined security hardening standards for developer machines or environments. Developers configure their own laptops, workstations, and local toolchains however they see fit, and there is no agreed baseline for operating system settings, disk encryption, patching, or access controls.

Because every environment is set up differently and nothing is documented, the organisation has no way to know whether source code, credentials, or build tooling are adequately protected. Any security that exists is incidental and depends entirely on the individual developer.

## Level 1 - Verify hardening standards or security checklist for development environment

At this stage the organisation has produced written hardening standards or a security checklist that describes how a development environment should be configured. This typically covers items such as full-disk encryption, automatic screen locking, operating system and dependency patching, restricting administrative privileges, and keeping secrets out of source code.

The standard exists as guidance and is applied manually. Developers are expected to read the checklist and configure their own environments accordingly, and compliance is reviewed on an ad-hoc basis rather than being enforced automatically. This is an improvement over Level 0 because there is now a shared, documented baseline that everyone can be measured against, even if adherence still relies on individual effort.

## Level 2 - Verify implementation of harden template for development environment

Here the hardening standard is no longer just a document to follow by hand; it is implemented as a reusable, pre-configured template. This might take the form of a managed and golden machine image, a configuration-management profile (for example Ansible, Chef, or an MDM policy), or a containerised development environment such as a Dev Container that ships with the approved tooling and security settings baked in.

Because the secure baseline is delivered as a template, every developer starts from the same hardened state and the controls are applied consistently and repeatably instead of depending on each person to remember the checklist. Onboarding becomes faster and configuration drift between environments is significantly reduced.

## Level 3 - Verify that the security policies are enforced to align with in the development environment hardening standards

At the highest level of maturity the hardening standards are actively enforced rather than merely provided. Policies are applied and continuously monitored through tooling such as MDM/endpoint management, policy-as-code, and pre-commit or CI checks, so that non-compliant environments are detected and either remediated automatically or blocked from interacting with source code and pipelines.

Compliance status is tracked centrally, giving the organisation visibility into which environments meet the baseline and which do not. The effectiveness of the hardening standards is reviewed periodically and the templates and policies are improved over time to keep pace with new threats, changes in tooling, and the organisation's risk appetite. This builds on Level 2 by closing the gap between having a hardened template and guaranteeing it is consistently in force.

# Notable Tools

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [pre-commit](https://github.com/pre-commit/pre-commit)

pre-commit is a framework for managing and maintaining multi-language Git pre-commit hooks. It lets you enforce hardening checks - such as detecting hardcoded secrets, blocking large or private-key files, and validating configuration - directly in the developer environment before code is ever committed. Running the same hooks both locally and in CI ensures the secure baseline is applied consistently across every developer's machine.

A typical `.pre-commit-config.yaml` defining a set of security and hygiene hooks:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-merge-conflict
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
```

Developers install the hooks once with `pre-commit install`, after which the checks run automatically on every commit.

<a href="https://github.com/pre-commit/action"><img src="images/github.svg" width="20px"> GitHub Actions</a>

```yaml
name: pre-commit

on:
  pull_request:
  push:
    branches: [main]

jobs:
  pre-commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.x"
      - uses: pre-commit/action@v3.0.1
```

## [Development Containers](https://github.com/devcontainers)

Development Containers (Dev Containers) let a project define its development environment as code in a `devcontainer.json` file. By describing the base image, tooling, extensions, and settings declaratively, every developer - and the CI pipeline - works from the same standardised, hardened environment, which directly supports the Level 2 "harden template" and Level 3 enforcement goals. Editors such as VS Code and platforms like GitHub Codespaces can build and open these containers automatically.

A minimal hardened `.devcontainer/devcontainer.json`:

```json
{
  "name": "secure-dev-environment",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "runArgs": ["--cap-drop=ALL", "--security-opt=no-new-privileges"],
  "remoteUser": "vscode",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {}
  },
  "postCreateCommand": "pre-commit install"
}
```

## References

- https://owasp.org/www-project-devsecops-guideline/
- https://github.com/pre-commit/pre-commit
- https://containers.dev/
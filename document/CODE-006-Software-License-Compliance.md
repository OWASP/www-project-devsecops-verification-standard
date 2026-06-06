# Software License Compliance

| ID             |
| -------------- |
| DSOVS-CODE-006 |

## Summary

Software license compliance is the process of ensuring that software applications, and the open-source components they depend on, are used in accordance with the terms of their respective license agreements.

It is an important part of DevSecOps because it helps ensure that developers consume third-party software in a legal and ethical manner, while also preventing potential copyright or intellectual property infringements. Modern applications pull in large transitive dependency trees, and a single permissively licensed package can introduce a copyleft or otherwise restrictive license deep in the graph.

By monitoring software license compliance, teams can be confident that third-party components are legally obtained, properly attributed, and free of obligations that conflict with how the application is distributed. License scanning also surfaces components with unknown or missing licenses, which often correlate with poorly maintained code and associated security risk.

## Level 0 - No tool to perform open-source software license compliance analysis

At this level there is no capability to identify the licenses of the open-source components used in the application. Dependencies are added freely and their license obligations are unknown, so the organisation has no visibility into whether it is meeting attribution requirements or whether copyleft and other restrictive licenses have been introduced. License risk is effectively invisible and is only discovered, if at all, during legal disputes, acquisition due diligence, or customer audits.

## Level 1 - Verify use of tool to perform on-demand scan for license violations when using third-party components in the application

A license scanning tool is available and is run manually, typically by a developer or release engineer before pulling in a new dependency or preparing a release. The tool inventories the components in use and reports the license attached to each, allowing obligations and conflicts to be assessed against an approved policy.

This is a clear improvement on Level 0 because license information becomes visible and decisions can be made deliberately. However, because scanning is on-demand and depends on someone remembering to run it, coverage is inconsistent. Results may not be recorded, and dependencies added between scans can slip through unnoticed.

## Level 2 - Verify the implementation of the third-party software licence scanning tool into the build pipeline to perform automated scans and report status to the build

License scanning is integrated into the build pipeline so that every build automatically inventories all direct and transitive dependencies and evaluates their licenses against the organisation's policy. The build reports the result, and a disallowed or unknown license can fail the build or raise a warning, providing fast and consistent feedback to developers.

This removes the reliance on manual effort that limited Level 1. Because the scan runs on every build, newly introduced dependencies are caught automatically and policy is applied uniformly across all projects that use the pipeline, giving the organisation continuous and repeatable visibility of its license posture.

## Level 3 - Verify that the findings are automatically recorded to a centralised issue tracker system and periodically review tool's effectiveness

Level 3 builds on the automated pipeline scanning of Level 2 by routing all findings into a centralised issue tracking or governance system. Every license violation, policy exception, and remediation is recorded, tracked over time, and made available for reporting across the whole portfolio rather than living only in transient build logs.

The organisation periodically reviews the effectiveness of the tool and its policy: it examines false positives, tunes the approved and denied license lists, validates that the dependency inventory (and any generated SBOM) is accurate, and confirms that obligations such as attribution are actually being met. This measured, continuously improved approach ensures license compliance scales with the organisation and adapts to new components and changing legal requirements.

# Notable Tools

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [ScanCode Toolkit](https://github.com/nexB/scancode-toolkit)

ScanCode Toolkit is a widely used open-source tool that detects licenses, copyrights, package metadata, and dependencies in source code and binaries. It is highly accurate, produces machine-readable output (JSON, SPDX, CycloneDX), and is well suited to building a detailed, auditable inventory of the licenses present in a codebase.

<a href="https://github.com/nexB/scancode-toolkit"><img src="images/github.svg" width="20px"> GitHub Actions

```yaml
name: scancode-license-scan
on:
  pull_request:
  push:
  workflow_dispatch:
jobs:
  scan:
    name: scancode
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - name: Install ScanCode Toolkit
        run: pip install scancode-toolkit
      - name: Run license and copyright scan
        run: |
          scancode --license --copyright --package \
            --json-pp scancode-results.json .
      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: scancode-results
          path: scancode-results.json
```

## [Trivy](https://github.com/aquasecurity/trivy)

Trivy is an open-source scanner from Aqua Security that, in addition to vulnerability detection, can scan project dependencies and report the licenses they use. It classifies findings by severity according to a configurable license policy and can fail the build when forbidden or restricted licenses are detected, making it a convenient single tool for combined license and security scanning.

<a href="https://github.com/aquasecurity/trivy-action"><img src="images/github.svg" width="20px"> GitHub Actions

```yaml
name: trivy-license-scan
on:
  pull_request:
  push:
  workflow_dispatch:
jobs:
  scan:
    name: trivy-license
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy license scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: fs
          scanners: license
          severity: HIGH,CRITICAL
          exit-code: "1"
          path: .
```

<a href="https://aquasecurity.github.io/trivy/latest/tutorials/integrations/gitlab-ci/"><img src="images/gitlab.svg" width="20px"> GitLab CI

```yaml
stages:
  - license-compliance

trivy-license:
  stage: license-compliance
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy fs --scanners license --severity HIGH,CRITICAL --exit-code 1 .
```

## [FOSSA](https://fossa.com/)

FOSSA is a commercial platform for open-source license compliance and vulnerability management. It provides automated dependency analysis, policy enforcement, attribution and notice file generation, and SBOM export, and integrates with CI pipelines to record findings centrally and report on license obligations across an organisation's portfolio.

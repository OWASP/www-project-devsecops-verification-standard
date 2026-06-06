---
layout: col-sidebar
title: OWASP DevSecOps Verification Standard
tags: DSOVS
level: 2
type: documentation
pitch: The DSOVS is a framework to identify gaps in implementing security within software development lifecyle
---

# OWASP DevSecOps Verification Standard

<img width="180px" align="right" style="float: right;" src="document/images/logo.svg">

The OWASP DevSecOps Verification Standard (DSOVS) is an open source framework that defines baseline requirements for any software project or organisation. You can use the DSOVS for:

- 🧐 **Gap Analysis**

  - DSOVS can be used to identify gaps that exist within a single or multiple software projects by providing internal or external analysts' with a clearly defined standard that cover all areas of the secure software development lifecycle.

- 🗺️ **Maturity Roadmap**

  - DSOVS can be used by developers, architects, security people and anyone else to identify existing DevSecOps maturity levels whilst mapping a clear path to work towards heightened maturity.

- ⚠️ **During Third-party Risk Asessments**
  - DSOVS can be used to audit the software development lifecycle (SDLC) maturity of third-parties which is important as it ensures that their software development processes are resilient and helps identify any potential vulnerabilities that exist due to people, processes or software.

## 🧮 Self-Assessment Tool

Try it live at **[dsovs.com](https://dsovs.com)**, or run it from the [`assessment/`](assessment/) folder. Rate your maturity against every DSOVS control and generate a report; it runs entirely in your browser, so your answers are saved locally on your device and never leave it. You can export your results as JSON or print them to PDF.

Building your own tooling? Every control is also published as machine-readable data: the [JSON API](dist/dsovs.json) is generated from the source-of-truth files under [`data/controls/`](data/controls/).

## 💬 Connect with Us

<li><a href="https://owasp.slack.com/messages/project-devsecops-verification-standard/details/"><img src="document/images/slack_logo.png" width="14px">  #project-devsecops-verification-standard</a></li>
<li><a href="https://www.linkedin.com/in/theonejvo/"><img src="document/images/linkedin.svg" width="14px"> @theonejvo </a> (Jamieson Vincenti O'Reilly, Project Lead)</li><li><a href="https://www.linkedin.com/in/yudhiy/"><img src="document/images/linkedin.svg" width="14px"> @yudhiy </a> (Yudhi Yudhistira, Project Lead)</li>

## 🎉 Get Involved

Your contribution will help the DSOVS evolve as processes and technologies are ever changing.

We welcome any kind of contribution and feedback to help make the DSOVS an even better open source project.

Join our community today and be part of the journey

- 🐞 [Report errors (typos, grammar)](https://github.com/OWASP/www-project-devsecops-verification-standard/issues)
- 🛠️ [Fix errors or propose changes using a Pull Request](https://github.com/OWASP/www-project-devsecops-verification-standard/pulls)
- 🙋 [Ask Questions](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/q-a)
- 💡 [New Ideas](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas)

For each phase, there are streams that the DSOVS assesses:## 📖 Table-of-Contents

### Organisation Phase

✅ [ORG-001 Risk Assessment](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/ORG-001-Risk-Assessment.md)

✅ [ORG-002 Security Training](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/ORG-002-Security-Training.md)

✅ [ORG-003 Security Champion](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/ORG-003-Security-Champion.md)

✅ [ORG-004 Security Reporting](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/ORG-004-Security-Reporting.md)

### Requirements Phase

✅ [REQ-001 Security Policy and Regulatory Compliance](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REQ-001-Security-Policy-and-Regulatory-Compliance.md)

✅ [REQ-002 Security Requirements and Standards](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REQ-002-Security-Requirements-and-Standards.md)

✅ [REQ-003 Security User Stories and Acceptance Criterias](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REQ-003-Security-User-Stories-and-Acceptance-Criteria.md)

✅ [REQ-004 Security Issues Tracking Design](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REQ-004-Security-Issues-Tracking.md)

✅ [DES-001 Security Architecture Design Reviews](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/DES-001-Secure-Architecture-Design-Reviews.md)

✅ [DES-002 Threat Modelling](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/DES-002-Threat-Modelling.md)

### Code/Build Phase

✅ [CODE-001 Secure Development Environment](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-001-Secure-Development-Environment.md)

✅ [CODE-002 Hardcoded Secrets Detection](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-002-Hardcoded-Secrets-Detection.md)

✅ [CODE-003 Manual Secure Code Review](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-003-Manual-Secure-Code-Review.md)

✅ [CODE-004 Static Application Security Testing (SAST)](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-004-Static-Application-Security-Testing-SAST.md)

✅ [CODE-005 Software Composition Analysis (SCA)](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-005-Software-Composition-Analysis-SCA.md)

✅ [CODE-006 Software License Compliance](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-006-Software-License-Compliance.md)

✅ [CODE-007 Inline IDE Secure Code Analysis](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-007-Inline-IDE-Secure-Code-Analysis.md)

✅ [CODE-008 Container Security Scanning](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-008-Container-Security-Scanning.md)

✅ [CODE-009 Secure Dependency Management](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/CODE-009-Secure-Dependency-Management.md)

### Test Phase

✅ [TEST-001 Security Test Management](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/TEST-001-Security-Test-Management.md)

✅ [TEST-002 Dynamic Application Security Testing (DAST)](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/TEST-002-Dynamic-Application-Security-Testing-DAST.md)

✅ [TEST-003 Interactive Application Security Testing (IAST)](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/TEST-003-Interactive-Application-Security-Testing-IAST.md)

✅ [TEST-004 Penetration Testing](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/TEST-004-Penetration-Testing.md)

✅ [TEST-005 Security Test Coverage](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/TEST-005-Security-Test-Coverage.md)

### Release/Deploy Phase

✅ [REL-001 Artifact Signing](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-001-Artifact-Signing.md)

✅ [REL-002 Secure Artifact Management](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-002-Secure-Artifact-Management.md)

✅ [REL-003 Secret Management](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-003-Secret-Management.md)

✅ [REL-004 Secure Configuration](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-004-Secure-Configuration.md)

✅ [REL-005 Security Policy Enforcement](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-005-Security-Policy-Enforcement.md)

✅ [REL-006 Infrastructure-as-Code (IaC) Secure Deployment](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-006-Infrastructure-as-Code-Secure-Deployment.md)

✅ [REL-007 Compliance Scanning](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-007-Compliance-Scanning.md)

✅ [REL-008 Secure Release Management](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/REL-008-Secure-Release-Management.md)

### Operate/Monitor Phase

✅ [OPR-001 Environment Hardening](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/OPR-001-Environment-Hardening.md)

✅ [OPR-002 Application Hardening](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/OPR-002-Application-Hardening.md)

✅ [OPR-003 Environment Security Logging](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/OPR-003-Environment-Security-Logging.md)

✅ [OPR-004 Application Security Logging](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/OPR-004-Application-Security-Logging.md)

✅ [OPR-005 Vulnerability Disclosure](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/OPR-005-Responsible-Disclosure.md)

✅ [OPR-006 Certificate Management](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/OPR-006-Certificate-Management.md)

✅ [OPR-007 Attack Surface Management](https://github.com/OWASP/www-project-devsecops-verification-standard/blob/main/document/OPR-007-Attack-Surface-Management.md)

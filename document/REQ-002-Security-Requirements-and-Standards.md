# Security Requirements and Standards

| ID            |
| ------------- |
| DSOVS-REQ-002 |

## Summary

Application Security Requirements and Standards is concerned with defining concrete, testable security requirements for an application early in its lifecycle and aligning them with recognised industry standards and technology best practices. Frameworks such as the OWASP Application Security Verification Standard (ASVS) and the OWASP Mobile Application Security Verification Standard (MASVS) provide structured, verifiable requirements covering areas such as authentication, access control, data protection, and secure communication.

Capturing these requirements up front, rather than retrofitting controls after the fact, ensures that security expectations are explicit, agreed, and able to be verified during design, development, and testing.

In a DevSecOps environment, well-defined security requirements and standards play an important role by ensuring that applications are developed securely, deployed safely, and remain aligned with current best practices over time.

## Level 0 - No periodic audit to ensure alignment to industry security standards and technology best-practices

The project has no defined set of security requirements and makes no reference to recognised industry standards or technology best practices. Security expectations, where they exist at all, are implicit and depend on the individual judgement of whoever happens to be building a given feature. There is no audit or review to confirm that the application aligns with frameworks such as OWASP ASVS or MASVS.

Because requirements are neither written down nor verified, the team cannot demonstrate which security properties the application is meant to uphold. Weaknesses are typically discovered late, during penetration testing or after an incident, rather than being prevented by clear requirements stated up front.

## Level 1 - Verify that periodic audit to ensure alignment to industry security standards and technology best-practices is performed

A set of security requirements has been documented with reference to industry standards, and a periodic audit is performed to check the application's alignment with them. The team can point to an agreed baseline, drawn from sources such as OWASP ASVS, OWASP MASVS, or the OWASP Proactive Controls, and to evidence that this baseline has been reviewed.

At this level the requirements and the audit remain largely informal and detached from day-to-day delivery. Reviews tend to occur on a schedule or ahead of a release rather than being woven into design and development, so the requirements may lag behind the code and best practices may be applied unevenly across teams.

## Level 2 - Verify that real-time verification to industry security standards and technology best-practices is performed

Security requirements are consistently applied and verification against industry standards is integrated into the software development lifecycle. Requirements derived from standards such as ASVS and MASVS are treated as first-class acceptance criteria, considered during design and checked continuously as the application evolves rather than only at periodic checkpoints.

This integration means deviations from the agreed standards are surfaced close to the point at which they are introduced and can be addressed before they reach production. Security requirements thereby become a routine, expected part of how features are built and reviewed, providing an ongoing view of how well the application aligns with best practice.

## Level 3 - Verify that applicable standards and best practices are enforced and periodic review schedule is defined

The applicable standards and best practices are actively enforced, and a defined periodic review schedule keeps the chosen requirements current. The organisation maintains controls that hold the project to its agreed requirements, and revisits the selected standards and the targeted ASVS or MASVS levels on a regular cadence so that emerging threats, new technologies, and updated guidance are reflected promptly.

At this level the requirements programme is itself measured and improved. The organisation tracks indicators such as coverage of requirements, the rate at which deviations are found and fixed, and how requirements perform against real findings, and uses these to refine both the requirements and the way they are verified. Security requirements thus become a continuously improving capability aligned with the organisation's risk appetite.

## Further reading
- [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/) - A catalogue of testable web application security requirements organised into verification levels, ideal for defining requirements early.
- [OWASP Mobile Application Security Verification Standard (MASVS)](https://mas.owasp.org/MASVS/) - The equivalent standard for mobile applications, providing verifiable security requirements for mobile platforms.
- [OWASP Proactive Controls](https://owasp.org/www-project-proactive-controls/) - A developer-focused set of the most important security techniques to build into software from the outset.
- [NIST SP 800-218 Secure Software Development Framework (SSDF)](https://csrc.nist.gov/projects/ssdf) - Includes practices for defining and communicating security requirements throughout the development lifecycle.
- [OWASP SAMM - Security Requirements](https://owaspsamm.org/model/design/security-requirements/) - The SAMM Design practice describing maturity in eliciting and standardising security requirements.
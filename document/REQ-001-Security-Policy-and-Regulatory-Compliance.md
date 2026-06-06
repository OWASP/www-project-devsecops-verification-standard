# Security Policy and Regulatory Compliance

| ID            |
| ------------- |
| DSOVS-REQ-001 |

## Summary

Security Policy and Regulatory Compliance is concerned with identifying the laws, regulations, and contractual obligations that apply to a software project and translating them into security policy the project must meet. Obligations such as GDPR, PCI DSS, and HIPAA impose specific requirements depending on the data an application handles and the markets it operates in.

The objective is to establish a clear baseline of what the organisation is required to do, verify that those obligations are being met, and keep that view current as regulations and business commitments change.

DevSecOps is an approach to software development that incorporates security into design and delivery while enabling automation and efficient maintenance. This makes security policy and regulatory compliance an integral part of DevSecOps, as it helps organisations meet their obligations continuously rather than treating compliance as a periodic, after-the-fact exercise.

## Level 0 - No periodic compliance verification activities performed

The organisation has not identified which laws, regulations, or contractual obligations apply to the project, and there is no process to verify that these obligations are being met. Requirements such as GDPR, PCI DSS, or HIPAA may be relevant to the data the application handles, but no one has formally mapped them to the work being delivered. Any awareness of compliance tends to be incidental, residing in the knowledge of individual team members rather than in a repeatable activity.

As a result, the project cannot demonstrate whether it satisfies its regulatory or contractual duties. Gaps surface only reactively, typically during an external audit, a customer security review, or after an incident has already occurred.

## Level 1 - Verify that periodic compliance audit is performed and documented

The organisation has identified the applicable laws, regulations, and contractual obligations and has documented them, and a compliance audit is carried out on a periodic basis with its results recorded. This establishes a known baseline: the project can point to a written set of obligations and to evidence that it has been checked against them at least once in recent memory.

At this level the activity is still largely manual and informal. Audits may be triggered by a calendar reminder or an upcoming deadline rather than embedded in the way the project is run, and the translation of obligations into concrete security policy may be inconsistent. Nevertheless, the documentation provides a foundation that later levels build upon.

## Level 2 - Verify implementation of real-time compliance verification and the findings are automatically recorded to a centralised issue tracker system

Compliance verification is integrated into the software development lifecycle rather than performed as a stand-alone exercise. Applicable obligations have been translated into explicit security policy that the project is expected to meet, and adherence is checked continuously as changes are made, so that deviations are surfaced close to the point at which they are introduced.

Findings are routed into a centralised issue tracker so that compliance gaps are managed alongside other engineering work, with clear ownership and traceability. This consistent, integrated approach means that compliance is treated as a routine property of delivery rather than an event, and the project can show an ongoing record of how it has met its obligations.

## Level 3 - Verify that compliance status is enforced and periodic review schedule is defined

Compliance status is actively enforced and is governed by a defined periodic review schedule. The organisation does not merely detect deviations but maintains controls that keep the project within its policy boundaries, and the set of applicable obligations is revisited on a regular cadence so that new regulations, contractual changes, or shifts in the threat landscape are reflected in policy promptly.

At this level the effectiveness of the compliance programme itself is measured and improved. Metrics such as the time taken to remediate findings, recurrence rates, and audit outcomes are tracked over time and used to refine the controls and the policy. Compliance thereby becomes a continuously improving capability that is aligned with the organisation's risk appetite rather than a static checklist.

## Further reading
- [NIST SP 800-218 Secure Software Development Framework (SSDF)](https://csrc.nist.gov/projects/ssdf) - Practices such as PO (Prepare the Organization) cover defining security requirements and meeting regulatory expectations across the lifecycle.
- [OWASP SAMM - Policy & Compliance](https://owaspsamm.org/model/governance/policy-and-compliance/) - The Governance practice that this control aligns to, describing maturity in identifying obligations and verifying compliance.
- [NIST Privacy Framework](https://www.nist.gov/privacy-framework) - A structure for mapping data protection obligations (such as those arising from GDPR) into organisational policy and controls.
- [PCI Security Standards Council - Document Library](https://www.pcisecuritystandards.org/document_library/) - Authoritative source for the PCI DSS requirements that apply to systems handling cardholder data.
- [HHS HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html) - Reference for the safeguards required when handling protected health information.
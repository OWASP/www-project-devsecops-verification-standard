# Security Test Management

| ID             |
| -------------- |
| DSOVS-TEST-001 |

## Summary

Security test management is concerned with how the environments and data used for security testing are provisioned, separated and maintained. Effective security testing depends on having somewhere safe to run intrusive checks, and on that environment behaving closely enough to production that the results are meaningful and trustworthy.

A central concern is isolation. Security tests can be destructive, generate large volumes of traffic, or deliberately attempt to exploit weaknesses, so they should never run against live production systems or against real customer data. At the same time, an environment that drifts too far from production produces misleading results: vulnerabilities present in production may be missed, and findings raised in the test environment may not be reproducible where it matters.

As this capability matures, organisations move from ad-hoc, manually prepared environments towards environments that are kept aligned with production, populated with realistic but non-sensitive test data, and ultimately provisioned and refreshed on demand. The goal is to make high-fidelity, repeatable security testing cheap and routine rather than a bespoke effort each time.

## Level 0 - Test environment is different from prod and test data is not prepared

At this level there is no managed approach to security test environments or test data. Testing, where it happens at all, may rely on whatever environment is convenient, and that environment differs from production in ways that are neither understood nor controlled. Configuration, dependencies and topology diverge arbitrarily, so any security testing performed against it gives little assurance about the real production system.

No deliberate test data is prepared. Testers either work with empty or trivial datasets that fail to exercise realistic code paths, or worse, resort to copies of production data containing sensitive information without proper handling. In both cases the foundations needed for credible, repeatable security testing are absent.

## Level 1 - Verify that the environment used for testing is different from production environment and test data is prepared

At this level the organisation deliberately separates testing from production. Security testing is carried out in a dedicated environment that is isolated from live systems and customers, so intrusive or destructive checks can be performed without putting production stability or real data at risk.

Test data is also prepared rather than left to chance. A purpose-built dataset is created to exercise the application's important functionality and security-relevant paths, and it avoids exposing real sensitive or personally identifiable information. This gives testers a stable, repeatable baseline and removes the temptation to test against raw production copies. The environment and data are still largely set up by hand and may be created once and reused, but the essential separation and intent are now in place.

## Level 2 - Verify that the test environment is maintained and configured to align with changes to production environment and test data is prepared

This level improves on the previous one by keeping the test environment deliberately aligned with production over time. Rather than being stood up once and allowed to drift, the environment is actively maintained so that configuration, dependencies, infrastructure and topology track changes made to production. As production evolves, the test environment is updated to match, which keeps security testing representative and reduces the risk of false confidence or unreproducible findings.

Prepared, non-sensitive test data continues to underpin testing, and it is curated to remain relevant as the application changes. Because the environment now mirrors production more faithfully, results carry greater weight: a vulnerability found in test is a strong indication of one in production, and a clean result is more credible. Maintaining this alignment typically requires documented configuration and a process to propagate production changes into the test environment.

## Level 3 - Verify that the test environment is identical to production and test data is created on-demands

At the highest level of maturity, the test environment is effectively identical to production, and both the environment and its data can be provisioned on demand. Infrastructure-as-code, automated provisioning and configuration management are used to spin up a faithful replica of production whenever it is needed, eliminating manual drift and removing the need to keep a long-lived environment carefully patched by hand.

Test data is likewise generated on demand, producing realistic, fit-for-purpose datasets that are free of real sensitive information and tailored to the test at hand. This makes thorough security testing fast, repeatable and consistent: teams can create a clean, production-equivalent environment and dataset for any test run, exercise it intensively, and tear it down afterwards. The result is high-fidelity security testing that scales with the organisation and integrates naturally into routine delivery.

## Further reading
- [OWASP Web Security Testing Guide (WSTG)](https://owasp.org/www-project-web-security-testing-guide/) - guidance on planning and executing web application security testing, including the testing environment.
- [OWASP SAMM - Verification](https://owaspsamm.org/model/verification/) - the Security Testing and Requirements-driven Testing practices that this capability supports.
- [NIST SP 800-218 Secure Software Development Framework (SSDF)](https://csrc.nist.gov/Projects/ssdf) - practices for preparing environments and protecting test data within the secure development lifecycle.
- [OWASP - Testing for Sensitive Information in test data (WSTG)](https://owasp.org/www-project-web-security-testing-guide/stable/4-Web_Application_Security_Testing/) - background on avoiding the use of real production/sensitive data in test environments.

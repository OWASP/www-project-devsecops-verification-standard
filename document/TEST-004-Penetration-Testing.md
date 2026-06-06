# Penetration Testing

| ID             |
| -------------- |
| DSOVS-TEST-004 |

## Summary

Penetration testing is manual, human-driven security testing in which skilled testers attempt to find and exploit weaknesses the way a real attacker would. It goes well beyond automated scanning: a tester reasons about business logic, chains together several lower-severity issues, and explores paths that tools cannot understand, surfacing vulnerabilities before malicious actors can.

This kind of testing provides genuine insight into the security posture of a system. Rather than a list of isolated scanner findings, it produces a picture of how an application could realistically be compromised, which helps organisations make informed decisions about where to invest in defences.

By revealing potential risks in context, penetration testing allows organisations to design and implement strategies that prevent security incidents, and to validate that their existing controls actually hold up under pressure.

## Level 0 - Penetration testing activity is ad-hoc and not scheduled

At this level there is no planned penetration testing. If any manual testing happens at all, it is sporadic and reactive, perhaps prompted by an incident or an individual's initiative. There is no defined scope, no regular cadence and no expectation that significant changes will be tested, so the organisation has little assurance about the security posture of its applications.

## Level 1 - Verify that annual penetration testing activity is performed

At this stage penetration testing is carried out on request or on a roughly annual basis, often to satisfy a compliance requirement or a customer expectation. A tester is engaged, given a scope, and produces a report of findings, which is a clear improvement on the ad-hoc situation at Level 0 because at least some human-led testing happens predictably.

The limitation is timing and coverage. A single annual engagement is easily outpaced by the rate of change in modern software, so meaningful changes shipped between tests may never receive manual scrutiny, and remediation of findings is not always tracked through to closure.

```mermaid
graph LR; Annual-Request-- pentest -->Application-- findings -->Report;
```

## Level 2 - Verify that penetration testing is performed per release or per feature

Here penetration testing is scheduled and scoped around the software delivery process rather than the calendar. Significant releases and substantial new features are assessed before or shortly after they ship, with a defined scope agreed for each engagement. This ties manual testing to the moments when risk is actually introduced, so important changes are reviewed by a human while they are still fresh.

Because testing is now repeatable and aligned to delivery, coverage is far more consistent than an annual snapshot. Findings are reported back to the responsible teams and feed into the development lifecycle, although the depth and continuity of tracking can still vary between engagements.

```mermaid
graph LR; Release-Scope-- pentest -->Application-- findings -->Report-- reported to -->Development-Teams;
```

## Level 3 - Verify that penetration testing is performed per feature regardless of release cycle and findings are recorded to a centralised issue tracker system

At the highest level penetration testing is a continuous, measured programme. Features are assessed as they are built, independent of the release cycle, and the activity is run as an ongoing capability rather than a series of disconnected projects. Every finding is recorded in a centralised issue tracking system and managed alongside the organisation's other security issues.

Crucially, the loop is closed: remediation is tracked through to resolution and fixes are retested to confirm they hold. Metrics drawn from the tracker, such as time-to-remediate and recurring issue classes, let the organisation measure the programme's effectiveness and continuously improve both its testing and its underlying engineering practices.

```mermaid
graph LR; Per-Feature-Scope-- continuous pentest -->Application-- findings -->Centralised-Issue-Tracker-- remediation -->Retest-- metrics -->Continuous-Improvement;
```

## Further reading

- [OWASP Web Security Testing Guide (WSTG)](https://owasp.org/www-project-web-security-testing-guide/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Penetration Testing Execution Standard (PTES)](http://www.pentest-standard.org/)
- [NIST SP 800-115 - Technical Guide to Information Security Testing and Assessment](https://csrc.nist.gov/publications/detail/sp/800-115/final)

# Notable Tools

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

It is worth stressing that this control is fundamentally about human expertise, not tooling. Frameworks such as [Metasploit](https://www.metasploit.com/) and [OWASP ZAP](https://github.com/zaproxy/zaproxy) are commonly used to assist a tester, but they are aids to a skilled practitioner rather than a substitute for one. The value of a penetration test comes from the judgement, creativity and attacker mindset of the person wielding the tools.

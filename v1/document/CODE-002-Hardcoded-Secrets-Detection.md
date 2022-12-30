# Hardcoded Secrets Detection

| ID             |
| -------------- |
| DSOVS-CODE-002 |

## Summary

Hardcoded secrets scanning is a security process used in DevSecOps that involves scanning code for hardcoded passwords, tokens, and other identifying information. 

The goal of hardcoded secrets scanning is to identify and replace any insecurely stored credentials or secrets, as these can be exploited by malicious actors. 

The process typically involves scanning source code, configuration files, and other related artifacts for secrets, which are then checked against appropriate levels of access control. 

Any secrets that are deemed insecure are then reported to the relevant parties and can be replaced with more secure alternatives.

## Level 0 - No tool to perform hardcoded secret scanning

At this level of security maturity, there are no tools available to perform secret scanning. 

## Level 1 - Verify use of tool to perform on-demand scan to identify hardcoded secrets in the source code

At this stage, a secrets detection tool is present but the scanning is performed on a case-by-case basis. It is not automated and the results may not be reported or recorded. 

## Level 2 - Verify the implementation of the hardcoded secrets scanning tool into the build pipeline to perform automated scans and report status to the build

Here, secrets scanning is implemented into the software build pipeline. This means that whenever a build is executed, an automated secrets scan will be triggered and the results will be reported.

## Level 3 - Verify that the findings are automatically recorded to a centralised issue tracker system and periodically review tool's effectiveness

Level 3 of secrets scannnig is the same as level 2, with the addition of all identified security vulnerabilities being recorded in a centralised issue tracking system and periodically reviewed to evaluate the effectiveness of the secrets detection tool. This means that the same type of automated scans are being performed, but the results are being collected, tracked and analysed for future use and improvement.

# Notable Tools 

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [OWASP ZAP](https://github.com/zaproxy/zaproxy)

The OWASP Zed Attack Proxy (ZAP) is one of the world’s most popular free security tools and is actively maintained by a dedicated international team of volunteers. It can help you automatically find security vulnerabilities in your web applications while you are developing and testing your applications. It's also a great tool fo
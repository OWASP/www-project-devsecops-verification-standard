# Application Hardening

| ID            |
| ------------- |
| DSOVS-OPR-002 |

## Summary

Application hardening is the process of enhancing the security of an application by reducing its attack surface at runtime. This typically involves applying secure configuration defaults, removing features, sample content and debug endpoints that are not needed in production, enforcing strong transport security, and running the application with the least privilege it requires to function.

It is an important part of DevSecOps because even well-written code can be left dangerously exposed by weak runtime configuration: verbose error pages that leak internals, missing security HTTP headers, outdated TLS settings, or a process running as root. Hardening closes these gaps by aligning the deployed configuration with recognised best practice such as the OWASP Secure Headers Project guidance.

By taking these proactive measures and verifying them automatically, organisations ensure their applications meet industry best practices and remain resilient against the ever-evolving world of cyber threats.

## Level 0 - No application vulnerability scanning tool

At this level the application runs with its default configuration and no process exists to assess or harden it. Debug modes, default credentials, sample applications and administrative endpoints may remain enabled, security HTTP headers are typically absent, and transport security is whatever the framework or server happens to ship with.

Because nothing measures the runtime configuration against a baseline, weaknesses such as information-leaking error pages or weak TLS ciphers persist unnoticed and provide an easy foothold for attackers.

## Level 1 - Verify use of tool to perform on-demand scan to identify application vulnerabilities in production environment

At this stage an engineer hardens the application manually against a defined baseline and verifies the result on demand. This might involve disabling debug and directory listing, removing unused modules and default content, configuring response headers such as `Content-Security-Policy`, `Strict-Transport-Security` and `X-Content-Type-Options` in line with the OWASP Secure Headers Project, and checking the TLS configuration with a tool such as testssl.sh before release.

This is a clear improvement because the running application is now compared against an objective standard. However, the work is ad hoc and relies on individual diligence, so hardening is applied inconsistently across services and configuration can drift back to insecure defaults between manual checks.

## Level 2 - Verify that the vulnerability scanning tool is scheduled to perform automated scans and report status to system owner through a centralised issue tracking system

Here, application hardening is codified and verified automatically within the pipeline. Secure defaults are baked into base images, deployment manifests and configuration templates, and the pipeline checks that they hold, for example by asserting that the expected security headers are present, that TLS meets the required policy, and that the container does not run as root.

Because these checks are automated and can gate a release, every deployment is held to the same hardened baseline rather than depending on whoever shipped it. The status of each check is reported back to the system owner and recorded centrally, giving a consistent, auditable view of each application's hardening posture.

## Level 3 - Verify implementation to apply automatic remediation at the time of vulnerability identified

At the highest level of maturity, hardening is enforced and monitored continuously across the running estate. Deployed applications are checked on an ongoing basis for drift away from the approved configuration, such as a security header being dropped, a debug endpoint reappearing, or a TLS policy weakening, and deviations are detected as soon as they occur.

Findings are consolidated into a centralised system where they are prioritised and trended over time, and remediation is applied automatically where it is safe to do so, for example by reapplying the hardened configuration or rejecting and redeploying a non-compliant release. The hardening standards themselves, including the required header set and TLS policy, are reviewed periodically so they keep pace with new guidance and emerging threats.

# Notable Tools

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [OWASP Secure Headers Project](https://github.com/OWASP/www-project-secure-headers)

The OWASP Secure Headers Project (OSHP) describes the HTTP response headers an application can set to harden its behaviour in the browser, along with recommended values and guidance on common pitfalls. It is the reference for configuring headers such as `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`, and is invaluable when defining the baseline that automated checks should enforce.

A typical hardened set of response headers, applied at the application or reverse proxy layer, looks like this:

```nginx
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;
server_tokens off;
```

## [testssl.sh](https://github.com/drwetter/testssl.sh)

testssl.sh is a free command-line tool that checks a server's TLS/SSL configuration on any port, reporting on supported protocols, cipher suites, certificate details and known vulnerabilities such as Heartbleed and ROBOT. It is self-contained and easy to run in a pipeline, making it ideal for verifying that an application's transport security meets the required policy before and after deployment.

<a href="https://github.com/drwetter/testssl.sh"><img src="images/github.svg" width="20px"> GitHub Actions

```yaml
name: testssl
on:
  workflow_dispatch:
  schedule:
    - cron: "0 6 * * *" # run once a day at 6 AM
jobs:
  testssl:
    runs-on: ubuntu-latest
    steps:
      - name: Clone testssl.sh
        run: git clone --depth 1 https://github.com/drwetter/testssl.sh.git
      - name: Run TLS assessment
        run: |
          ./testssl.sh/testssl.sh --quiet --severity HIGH \
            --jsonfile testssl-report.json https://example.com || true
      - name: Upload testssl report
        uses: actions/upload-artifact@v4
        with:
          name: testssl-report
          path: testssl-report.json
```

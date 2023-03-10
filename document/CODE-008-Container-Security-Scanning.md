# Container Security Scanning

| ID             |
| -------------- |
| DSOVS-CODE-008 |

## Summary

Container security scanning is a process of analysing the contents of containers to detect any vulnerable components, configuration issues, and malicious code. 

This process is important in DevSecOps as it allows developers to quickly identify any security risks in their container environment, allowing them to take steps to fix them before they become an issue. 

By scanning containers on a regular basis, organisations are able to keep their environments secure and compliant with industry best practices while also allowing them to take advantage of the agility and cost advantages offered by containers.

## Level 0 - No tool to perform container vulnerability analysis

At this level, there is no scanning tool in place, and vulnerabilities may go undetected until it is too late. Organizations operating at this level are more susceptible to cyber attacks, and may struggle to achieve compliance with industry standards.

## Level 1 - Verify tool is used to perform on-demand scan for container vulnerability analysis

Using a tool for on-demand scanning provides some level of security, but requires manual intervention and may cause delays in detecting vulnerabilities. This level can help organizations to quickly identify and address security issues, but may not be sufficient to provide continuous protection.


## Level 2 - Verify the implementation of container vulnerability analysis tool into the build pipeline to perform automated scans and report status to the build

By integrating a container scanning tool into the build pipeline, security checks become automated and vulnerabilities can be detected earlier in the development process. This level enables organizations to scale their DevSecOps practices and ensures that security is incorporated into the software development life cycle.

## Level 3 - Verify that the findings are automatically recorded to a centralised issue tracker system and periodically review tool's effectiveness

At this level, the container scanning process is not only automated but also integrated with a central issue tracker system, allowing for greater visibility and easier tracking of security issues. Periodic reviews of the effectiveness of the scanning tool can help organizations continuously improve their security posture and stay ahead of emerging threats.


# Notable Tools 

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [Trivy](https://github.com/aquasecurity/trivy)

Trivy is a container scanning tool that finds vulnerabilities, misconfigurations, secrets, SBOM in containers, Kubernetes, code repositories, clouds and more.

<a href="https://github.com/aquasecurity/trivy-action"><img src="images/github.svg" width="20px"> GitHub Actions

```
name: build
on:
  push:
    branches:
      - master
  pull_request:
jobs:
  build:
    name: Build
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Build an image from Dockerfile
        run: |
          docker build -t docker.io/my-organization/my-app:${{ github.sha }} .
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'docker.io/my-organization/my-app:${{ github.sha }}'
          format: 'table'
          exit-code: '1'
          ignore-unfixed: true
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'
```

<a href="https://aquasecurity.github.io/trivy/v0.18.3/integrations/gitlab-ci/"><img src="images/gitlab.svg" width="20px"> GitLab CI

```
Trivy_container_scanning:
  stage: test
  image:
    name: alpine:3.11
  variables:
    # Override the GIT_STRATEGY variable in your `.gitlab-ci.yml` file and set it to `fetch` if you want to provide a `clair-whitelist.yml`
    # file. See https://docs.gitlab.com/ee/user/application_security/container_scanning/index.html#overriding-the-container-scanning-template
    # for details
    GIT_STRATEGY: none
    IMAGE: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA"
  allow_failure: true
  before_script:
    - export TRIVY_VERSION=${TRIVY_VERSION:-v0.19.2}
    - apk add --no-cache curl docker-cli
    - docker login -u "$CI_REGISTRY_USER" -p "$CI_REGISTRY_PASSWORD" $CI_REGISTRY
    - curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin ${TRIVY_VERSION}
    - curl -sSL -o /tmp/trivy-gitlab.tpl https://github.com/aquasecurity/trivy/raw/${TRIVY_VERSION}/contrib/gitlab.tpl
  script:
    - trivy --exit-code 0 --cache-dir .trivycache/ --no-progress --format template --template "@/tmp/trivy-gitlab.tpl" -o gl-container-scanning-report.json $IMAGE
  cache:
    paths:
      - .trivycache/
  artifacts:
    reports:
      container_scanning: gl-container-scanning-report.json
  dependencies: []
  only:
    refs:
      - branches
```

<a href="https://github.com/dvuln/devsecops/blob/test/containerscan/trivy-azure.yml"><img src="images/azure.svg" width="40px"> Azure DevOps </a>

```
trigger:
  - master

pool:
  vmImage: ubuntu-latest

parameters:
  - name: imageName
    displayName: Docker Image Name

steps:
  - script: |
      sudo apt-get install wget apt-transport-https gnupg lsb-release
      wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
      echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
      sudo apt-get update
      sudo apt-get install trivy
      trivy image  -f json --output '$(Build.ArtifactStagingDirectory)/trivy-result.json' ${{ parameters.imageName }}
    displayName: "Run Trivy"
```

## 🙏 Credits

We could not do this without the amazing contributions made to the community so we'd like to take the time to show our appreciation to any external inspiration used. 

* [Teppei Fukuda](https://github.com/knqyf263)
* [Yudhi Yudhistira](https://github.com/devsecurityops)

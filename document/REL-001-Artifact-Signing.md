# Artifact Signing

| ID            |
| ------------- |
| DSOVS-REL-001 |

## Summary

Artifact signing is a security process that ensures the integrity of an artifact/binary that is released by a developer. 

This is done by using cryptographic and digital signing techniques to ensure that the artifact has not been tampered with and no malicious code has been inserted into it

Artifact signing is important for DevSecOps because it allows organizations to quickly and easily verify the authenticity of their software or applications before allowing them to be deployed into production environments. More recently, Code Signing has gained in popularity due to Supply Chain Security attacks, and used as one method in the application of security to build pipelines. 

It also provides a measure of assurance that their applications are secure and trustworthy, helping to build customer trust and loyalty.

## Level 0 - No package/code signing process defined

At this level, software deliverables are not digitally signed, leaving them vulnerable to unauthorized code access. There is no auditability or integrity assurance behind the software. Organizations operating at this level face significant security risks and lack the means to verify the authenticity of their code.

## Level 1 - Basic code signing with self managed keys

In this stage, software deliverables are signed, but the tools and processes are fragmented. Developers may handle their own private keys without centralized control, which can lead to key misuse or compromise. While some level of security is introduced, it falls short of ensuring comprehensive code integrity, authenticity, non-falsifiability and is not tamper proof.

## Level 2 -  Centralized code signing with enhanced key security

Level 2 involves the use of a centralized platform for code signing policy, workflow, and auditability. It also emphasizes the protection of sensitive signing keys in a secure Hardware Security Module (HSM). However, at this stage, code signing is not yet fully integrated with CI/CD processes or workflows, and not all use cases are covered. While this level offers improved security, it still lacks the full automation and integration required for DevSecOps. Typically at this level, organisations leverage key manage solutions such as AWS KMS, HashiCorp Vault, etc.

## Level 3 - Fully CI/CD integrated code signing and governance

At the highest level of this code signing maturity model, organizations have achieved full integration of code signing into their CI/CD processes. This means that all containers, artifacts, and software deliverables are signed. The implementation is seamlessly integrated with native signing tools and workflows, ensuring full auditability and governance over all signing processes. This level provides the highest level of security, code integrity, and authenticity, meeting the demands of modern DevSecOps practices. Typically at this level, organisations adopt keyless signing (a newer signing technique where you do not handle long-lived signing keys).

# Notable Tools 

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [cosign](https://github.com/sigstore/cosign)

cosign is an open source CLI utility for signing softwae artifacts, such as container images or blob files (i.e. bundled AWS Lambda code in a .zip file, or any type of software artifact) 


<a href="https://aquasecurity.github.io/trivy/v0.18.3/integrations/gitlab-ci/"><img src="images/gitlab.svg" width="20px"> GitLab CI

```
container_scan:
  stage: devsecops 
  script:
    - trivy image --scanners vuln $IMAGE_NAME --format cyclonedx  > trivy-output-$DATE-cyclonedx.json
  artifacts:
    when: always 
    paths:
      - trivy-output-$DATE-cyclonedx.json

generate_sbom:
  stage: devsecops
  script:
    - syft $IMAGE_NAME -o cyclonedx-json  > sbom-$DATE.syft.json
  artifacts:
    when: always 
    paths:
        - sbom-$DATE.syft.json

signing_and_attestation: 
  stage: publish
  id_tokens:
    SIGSTORE_ID_TOKEN:
      aud: sigstore
  variables:
    RUNNER_GENERATE_ARTIFACTS_METADATA: "true"
  script: 
    - IMAGE_DIGEST=`docker inspect --format='{{index .RepoDigests 0}}' $IMAGE_NAME` # Grab image digest, rather than image tag 
    - cosign sign $IMAGE_DIGEST --key $COSIGN_KEY_NAME # Sign the container image 
    - cosign attest --key $COSIGN_KEY_NAME  --type vuln --predicate trivy-output-$DATE-cyclonedx.json $OCI_IMAGE_DIGEST # Sign and create an attestation for our Trivy scan 
    - cosign attest --key $COSIGN_KEY_NAME  --type cyclonedx --predicate sbom-$DATE.syft.json $OCI_IMAGE_DIGEST # Sign and create an attestation for our SBOM 
  needs: 
    - devsecops
  artifacts:
    when: always 
    paths:
      - "artifacts*.json"
```

<a href="https://github.com/aquasecurity/trivy-action"><img src="images/github.svg" width="20px"> GitHub Actions

```
jobs:
  build-image:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write
      id-token: write # needed for signing the images with GitHub OIDC Token

    name: build-image
    steps:
      - uses: actions/checkout@v3.5.2
        with:
          fetch-depth: 1

      - name: Install Cosign
        uses: sigstore/cosign-installer@v3.1.1

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v2.1.0

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2.5.0

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v2.1.0
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - id: docker_meta
        uses: docker/metadata-action@v4.4.0
        with:
          images: ghcr.io/sigstore/sample-honk
          tags: type=sha,format=long

      - name: Build and Push container images
        uses: docker/build-push-action@v4.0.0
        id: build-and-push
        with:
          platforms: linux/amd64,linux/arm/v7,linux/arm64
          push: true
          tags: ${{ steps.docker_meta.outputs.tags }}

      # https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-an-intermediate-environment-variable
      - name: Sign image with a key
        run: |
          cosign sign --yes --key env://COSIGN_PRIVATE_KEY "${TAGS}@${DIGEST}"
        env:
          TAGS: ${{ steps.docker_meta.outputs.tags }}
          COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
          COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
          DIGEST: ${{ steps.build-and-push.outputs.digest }}

      - name: Sign the images with GitHub OIDC Token
        env:
          DIGEST: ${{ steps.build-and-push.outputs.digest }}
          TAGS: ${{ steps.docker_meta.outputs.tags }}
        run: cosign sign --yes "${TAGS}@${DIGEST}"

```

## References

- GHA from: https://github.com/marketplace/actions/cosign-installer 

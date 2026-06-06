# Secret Management

| ID            |
| ------------- |
| DSOVS-REL-003 |

## Summary

Secret Management is the process of securely storing, centrally managing, and controlling access to sensitive data such as passwords, API keys, database credentials, and encryption keys throughout the deployment and runtime lifecycle.

It is an important part of DevSecOps because it enables secrets to be injected into applications at deploy or run time rather than being embedded in source code, configuration files, or images, where they could be exposed to malicious actors. Centralised secret management also supports secure sharing of credentials across teams, automated rotation, and revocation, reducing manual handling and enabling faster, safer delivery cycles.

It is worth distinguishing this control from hardcoded-secret scanning (DSOVS-CODE-002). That control is about detecting secrets that have already been committed into source code, whereas Secret Management is concerned with how secrets are stored, rotated, and supplied to applications at deploy time so that they never need to be hardcoded in the first place. The two are complementary: scanning catches mistakes, while sound secret management removes the need to take the risk at all.

## Level 0 - No secret store or vault used

At this level there is no dedicated secret store or vault. Credentials, tokens, and keys are kept in plaintext wherever it is convenient, such as in source code, configuration files, environment files committed to version control, build scripts, or deployment manifests. Because secrets travel with the code and infrastructure definitions, they are readily exposed to anyone with repository or system access.

There is no access control specific to secrets, no rotation, and no audit trail of who used a credential or when. A single leaked file can compromise multiple systems, and rotating a leaked secret is slow and error-prone because no one has a reliable inventory of where it is used.

## Level 1 - Verity implementation of a centralised secure storage for credentials and secrets

At this stage the organisation has introduced a dedicated, centralised secret store where credentials and keys are kept encrypted and out of source code. Secrets are retrieved from this store rather than read from files checked into the repository, giving teams a single, protected place to manage sensitive values.

Usage at this level is typically manual or on-demand: developers and operators fetch secrets when configuring an application or environment, and access is granted to the store rather than to scattered files. While this is a significant improvement over plaintext storage, retrieval and injection are not yet fully automated within the pipeline, and rotation is performed reactively rather than on a schedule.

## Level 2 - Verify periodic review and rotation schedule of secrets

At this level secret retrieval is automated and integrated into the delivery pipeline, so that applications receive their secrets at deploy or run time directly from the central store without manual handling. The pipeline authenticates to the secret manager, pulls the values it needs, and injects them into the running workload, keeping plaintext credentials out of build logs, images, and manifests.

In addition, secrets are subject to a defined review and rotation schedule. Credentials are rotated periodically and re-issued automatically, and access policies are reviewed so that only the workloads and identities that need a secret can read it. This limits the useful lifetime of any leaked credential and reduces the blast radius of a compromise.

## Level 3 - Verify implementation of dynamic secrets or secretless process to avoid secrets to be stored within the application

At the highest level of maturity, secret management is centralised, access-controlled, and fully audited, and the organisation moves toward dynamic secrets or a secretless model so that long-lived credentials are never stored within the application at all. Rather than handing an application a static password, the secret manager issues short-lived, on-demand credentials that are generated when needed and automatically expire shortly afterwards, or the workload authenticates using its own platform identity so that no shared secret changes hands.

Every issuance and access is logged for audit, policies enforce least-privilege access per workload identity, and the effectiveness of rotation and revocation is continuously reviewed. Because credentials are ephemeral and tightly scoped, a leaked value is of little use to an attacker, and the organisation achieves strong, traceable, and continuously improved control over its secrets.

# Notable Tools

⚠️ **Disclaimer**

Apart from official OWASP Projects, the tools in this section have been chosen on the basis of their proven capabilities alone and there is no other relationship between the DSOVS project leaders and the creators or vendors who maintain them. 

If you have a suggestion for a notable tool please [💡 Suggest a Tool](https://github.com/OWASP/www-project-devsecops-verification-standard/discussions/categories/ideas) 

## [HashiCorp Vault](https://github.com/hashicorp/vault)

HashiCorp Vault is a widely adopted secret management platform that provides centralised, access-controlled, and audited storage of secrets. Beyond storing static secrets, Vault can generate dynamic, short-lived credentials on demand (for databases, cloud providers, and more) and supports workload identity authentication, making it a strong fit for the dynamic and secretless approaches expected at Level 3.

<a href="https://github.com/hashicorp/vault-action"><img src="images/github.svg" width="20px"> GitHub Actions

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # authenticate to Vault via OIDC, no static token
      contents: read
    steps:
      - uses: actions/checkout@v4

      - name: Import secrets from Vault
        uses: hashicorp/vault-action@v3
        with:
          url: https://vault.example.com
          method: jwt
          role: ci-deploy
          secrets: |
            secret/data/app/prod DB_PASSWORD | DB_PASSWORD ;
            secret/data/app/prod API_KEY | API_KEY

      - name: Deploy with injected secrets
        run: ./deploy.sh   # DB_PASSWORD and API_KEY are present only for this job
```

## [Mozilla SOPS](https://github.com/getsops/sops)

SOPS (Secrets OPerationS) encrypts the values inside YAML, JSON, and other config files while leaving the structure readable, so encrypted secrets can be safely committed to a repository and decrypted only at deploy time. It integrates with KMS providers such as AWS KMS, GCP KMS, Azure Key Vault, and age/PGP keys, making it well suited to GitOps workflows.

<a href="https://github.com/getsops/sops"><img src="images/gitlab.svg" width="20px"> GitLab CI

```yaml
deploy:
  stage: deploy
  script:
    # SOPS_AGE_KEY (or a cloud KMS role) is provided as a protected CI variable
    - sops --decrypt secrets/prod.enc.yaml > secrets/prod.yaml
    - kubectl apply -f secrets/prod.yaml
    - rm -f secrets/prod.yaml   # remove plaintext after use
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## [Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets)

Sealed Secrets is a Kubernetes-native approach that lets you encrypt a standard Secret into a `SealedSecret` custom resource that is safe to store in Git. Only the in-cluster controller, which holds the private key, can decrypt it back into a usable Secret, so plaintext credentials never live in the repository or in CI logs.

```bash
# Encrypt a secret locally using the cluster's public key (offline-safe)
kubectl create secret generic app-credentials \
  --from-literal=DB_PASSWORD='s3cr3t' \
  --dry-run=client -o yaml \
  | kubeseal --controller-namespace kube-system --format yaml \
  > sealed-app-credentials.yaml

# Commit sealed-app-credentials.yaml to Git, then apply via your GitOps pipeline.
# The controller decrypts it into a normal Secret inside the cluster:
kubectl apply -f sealed-app-credentials.yaml
```

## References

- HashiCorp Vault documentation: https://developer.hashicorp.com/vault/docs
- Mozilla SOPS: https://github.com/getsops/sops
- Sealed Secrets: https://github.com/bitnami-labs/sealed-secrets

# Capivara backend: deployment and Google Cloud authentication

This README records the production deployment as it exists today and defines
the next infrastructure task: replace the GitHub Actions Google service account
key with Workload Identity Federation (WIF). It is a handoff, not a claim that
WIF is already configured.

## Current deployment

- `.github/workflows/cd.yml` deploys on pushes to `main` or manual dispatch.
  Its job uses the GitHub `production` environment and requests
  `id-token: write`.
- The workflow authenticates with `google-github-actions/auth@v2` using the
  long-lived `GCP_CREDENTIALS` JSON secret. `GOOGLE_CREDENTIALS` passes that
  same JSON to both `terraform init` and `terraform apply`.
- Terraform in `tf/` uses the Google provider (`>= 5.0.0`) and the GCS backend
  bucket `ifsp-extensao-tfstate`, prefix `tf/terraform.tfstate`. It manages an
  Artifact Registry repository, a static IP, a firewall rule, and a Compute
  Engine VM. The workflow reads the VM IP and registry URL from Terraform
  outputs. The existing `terraform apply -auto-approve` has no reviewed plan
  gate; improving that is a separate deployment safety task.
- CI does not pin a Terraform version, the HCL permits any Terraform version
  from 1.0 and any Google provider from 5.0, and `tf/` has no committed
  `.terraform.lock.hcl`. Address version drift separately from the credential
  cutover so an authentication failure is easy to distinguish from an upgrade.
- The runner configures Docker authentication with `gcloud`, builds and pushes
  the image, then deploys over SSH. The VM pulls from Artifact Registry with
  its **own attached service account** and a token from the metadata server.
  This VM identity is separate from the GitHub deploy identity.
- App, OTel, and dashboard credentials are individually named GitHub secrets
  and variables. The complete list and migration process are in
  [production deployment configuration](.github/DEPLOYMENT.md). WIF changes
  only Google authentication for the GitHub job; it does not replace those
  application secrets or the AWS CodeArtifact role.

`tf/main.tf` also grants `roles/iam.serviceAccountUser` on the VM service
account to `github-actions-capivara-solida@metriq-seo.iam.gserviceaccount.com`.
That binding is **not** a WIF trust binding. Confirm the identity inside the
current `GCP_CREDENTIALS` key and the purpose of this binding before changing
it. Do not assume the key belongs to this service account solely from its name.

## WIF migration objective

Allow only this repository's authorized production workflow to impersonate a
dedicated Google deploy service account through GitHub OIDC. The deploy account
must be able to read/write and lock the existing GCS Terraform state, manage
only the resources this stack owns, and push to its Artifact Registry
repository. Remove the service account key from the workflow after successful
verification, then disable and delete the key in Google Cloud.

Service account impersonation is the proposed path here because the workflow
uses Terraform's GCS backend, the Google provider, `gcloud`, and Artifact
Registry in one job. Direct WIF may be feasible, but support and permissions
for every consumer would need separate validation. Do not change the VM's
attached service account as part of this migration.

### Facts to discover before implementation

Record these in the next task without pasting secret values into an issue or PR:

1. GitHub repository owner/name, immutable repository ID and owner ID, and
   whether `production` environment protection is configured. The workflow
   uses `main`; verify the expected OIDC claims for this environment.
2. Project **number** that will host the WIF pool/provider, target GCP project
   ID, deploy service account email, and project containing the GCS state
   bucket. These may be different projects.
3. Current key's service account email and its effective IAM roles. Inventory
   permissions required by Terraform state, Compute Engine, IAM/service
   accounts, firewall/network, Artifact Registry creation, and image push.
   Grant narrow roles at resource scope where supported; avoid `Editor` or
   `Owner` as shortcuts.
4. Who can bootstrap the WIF pool, provider, and service account IAM binding.
   The current key can be retained for a reviewed one-time bootstrap, or an
   administrator can provision WIF outside this stack. A new pool in `tf/`
   cannot authenticate the first `terraform init` that needs it.
5. Whether organization policies permit GitHub's OIDC issuer and which
   existing service account key can be disabled after cutover.

### Proposed implementation sequence

1. Create a WIF pool and OIDC provider with issuer
   `https://token.actions.githubusercontent.com`. Map `google.subject` to
   `assertion.sub` and the immutable `repository_id` and `repository_owner_id`
   claims to attributes. Restrict the provider condition to this repository,
   owner, `refs/heads/main`, and the production environment when that claim is
   available. Use the observed claims, not a guessed `sub` string: GitHub's
   subject format can differ when environments or immutable subjects are used.
2. Create or identify a dedicated deploy service account. Grant the WIF
   principal for the intended repository `roles/iam.workloadIdentityUser` on
   that account. Do not grant this role to an entire pool. Grant the deploy
   account the required GCS backend and deployment roles separately. Keep the
   VM service account and its Artifact Registry reader role intact.
3. Add non-secret GitHub configuration variables such as
   `GCP_WORKLOAD_IDENTITY_PROVIDER` (full provider resource name using the
   **project number**) and `GCP_DEPLOY_SERVICE_ACCOUNT` (email). Keep the
   `production` job environment and `id-token: write` permission.
4. Change the Google auth step to use `workload_identity_provider` and
   `service_account` instead of `credentials_json`. Create/export the
   credential file for later steps. Remove both `GOOGLE_CREDENTIALS` entries
   from Terraform steps so the GCS backend and Google provider use the
   generated `GOOGLE_APPLICATION_CREDENTIALS` path. Keep checkout before auth.
   A sketch of the target step, using the current action major version:

   ```yaml
   - name: GCP Auth
     uses: google-github-actions/auth@v2
     with:
       workload_identity_provider: ${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}
       service_account: ${{ vars.GCP_DEPLOY_SERVICE_ACCOUNT }}
       project_id: ${{ vars.GCP_PROJECT_ID }}
       create_credentials_file: true
       export_environment_variables: true
   ```

5. Test authentication, `gcloud` registry access, `terraform init`,
   `terraform validate`, and a saved `terraform plan` before any apply. Inspect
   the plan for unexpected replacements or deletions. Ensure that the GCS
   backend can lock/unlock state with the new identity. After an approved plan,
   perform one production deployment and verify the image push, VM pull, API,
   collector, and dashboard publishing.
6. After the new path works, disable the old key in GCP and verify another
   deployment. Then delete `GCP_CREDENTIALS` from GitHub and delete the key in
   GCP. Keep a secure record of the IAM and workflow changes for rollback.

The auth action writes a temporary `gha-creds-*.json` file into the job
workspace when credential-file export is enabled. `.gitignore` and
`.dockerignore` exclude that pattern, because this workflow builds with the
repository root as Docker context. Do not upload it as an artifact, print it,
or pass it as a Docker build secret.

### Acceptance criteria and rollback

- The production job succeeds with no `GCP_CREDENTIALS` or
  `GOOGLE_CREDENTIALS` reference in the workflow.
- The WIF provider rejects tokens from another repository, branch, owner, or
  unapproved environment. The service account IAM binding names only the
  intended external principal or attribute set.
- Terraform accesses the existing GCS state without migration or resource
  churn. A reviewed plan shows the expected changes only.
- `gcloud auth configure-docker`, image push, SSH deploy, VM image pull, and
  application/OTel checks pass end to end.
- The old key is disabled and later deleted after successful verification.

If WIF fails before key deletion, re-enable the old key if necessary and
restore the previously working auth step and `GOOGLE_CREDENTIALS` for a
controlled rollback. Do not recreate or move the
Terraform state to solve an authentication error. Keep WIF resources and IAM
bindings available while investigating; remove them only after confirming no
workflow uses them.

## Source documentation

- [Google Cloud: WIF for deployment pipelines](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Google Cloud: WIF best practices](https://docs.cloud.google.com/iam/docs/best-practices-for-using-workload-identity-federation)
- [Google GitHub auth action](https://github.com/google-github-actions/auth#readme)
- [GitHub OIDC claims and subjects](https://docs.github.com/en/actions/reference/security/oidc)
- [Terraform GCS backend authentication](https://developer.hashicorp.com/terraform/language/backend/gcs)

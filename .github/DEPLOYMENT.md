# Production deployment configuration

The `Build and Deploy` workflow uses the GitHub Actions `production` environment.
Create it under **Settings → Environments** before deploying. Restrict it to the
`main` branch and add required reviewers if your GitHub plan supports them.
Put the names below in that environment. Repository-level secrets and variables
with the same names also work; environment values take precedence.
For a private repository on GitHub Free, use repository-level secrets and
variables because environment-level secrets are not available on that plan.

## Secrets

Store these as separate Actions secrets (no surrounding quotes):

- `DATABASE_URL` — production PostgreSQL connection string.
- `JWT_SECRET` — signing secret.
- `RESEND_API_KEY` — email provider key.
- `OPENAI_API_KEY` — OpenAI key.
- `POSTHOG_READABLE_API_KEY` — PostHog query key.
- `GRAFANA_CLOUD_AUTH_HEADER` — base64 payload used after `Basic ` by the OTel collector.
- `GRAFANA_SERVICE_ACCOUNT_TOKEN` — only needed when `GRAFANA_URL` is configured.
- `VM_SSH_KEY` — existing private SSH key for deployment.
- `VM_SSH_PUBLIC_KEY` — public SSH key used by Terraform. This can be moved to a
  variable in a later change; the workflow currently reads it as a secret.
- `AWS_CODEARTIFACT_READ_ROLE_ARN` — existing AWS role ARN. This can likewise be
  moved to a variable later.

## Variables

Store these as Actions variables:

- Existing infrastructure/build settings: `PROJECT_NAME`, `GCP_PROJECT_ID`,
  `REGION`, `ZONE`, `NODE_VERSION`.
- Google authentication: `GCP_WORKLOAD_IDENTITY_PROVIDER` and
  `GCP_DEPLOY_SERVICE_ACCOUNT` (values below).
- Application: `GOOGLE_CLIENT_ID`, `WEBPAGE_BASE_URL`, `APP_URL`, `EMAIL_FROM`,
  `POSTHOG_API_HOST`, `POSTHOG_PROJECT_ID`.
- Optional OpenAI identifiers: `OPENAI_ORGANIZATION_ID`, `OPENAI_PROJECT_ID`.
- Telemetry: `GRAFANA_CLOUD_OTLP_ENDPOINT` (HTTPS collector URL).
- Optional dashboard publishing: `GRAFANA_URL`,
  `GRAFANA_PROMETHEUS_DATASOURCE_UID`, `GRAFANA_LOKI_DATASOURCE_UID`,
  `GRAFANA_FOLDER_UID`. When `GRAFANA_URL` is set, both datasource UIDs and the
  service account token are required.

`NODE_ENV=production`, `ENV=prod`, `PORT=8000`, and `DEBUG=false` are set in
`devops/write-runtime-env.mjs`. The local `.env.example` also lists
`GOOGLE_CLIENT_SECRET`, `OPENAI_API_TOKEN_BASE_URL`, and `API_PORT`; the current
application does not read those names, so the deployment does not include them.
The Docker image already provides the app's OTel exporter settings.

## Migration and verification

1. Copy each production value from the old `APP_ENV_FILE` into its named secret
   or variable. Copy values only, without `.env` quotes or `NAME=` prefixes.
   Do not paste values into workflow YAML, Terraform variables, or job logs.
2. Confirm all required names exist. The first deployment step fails with names
   of missing inputs before Terraform changes infrastructure or the image builds.
3. Run the workflow manually on `main`. Check the app starts, the collector
   exports telemetry, and dashboard publishing succeeds if enabled.
4. Remove `APP_ENV_FILE` after the new deployment succeeds. Rotate credentials
   if the old combined value was copied into logs or shared outside GitHub.

The workflow writes `deploy/app/.env` and `deploy/otel/.env` on the runner,
copies them over SSH, and sets mode `0600` on the VM before starting containers.
Both files are ignored by Git and Docker's build context. Terraform receives
only infrastructure values; application and Grafana credentials do not enter
Terraform state. The generated files still exist on the VM, so restrict SSH
access and protect the VM disk and backups accordingly.

## Google Workload Identity Federation

The deployment uses service account impersonation through GitHub OIDC. Set these
non-secret Actions variables in the `production` environment (or at repository
level if environment variables are unavailable):

```text
GCP_PROJECT_ID=metriq-seo
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/376622937099/locations/global/workloadIdentityPools/capivara-github/providers/backend-production
GCP_DEPLOY_SERVICE_ACCOUNT=capivara-deploy@metriq-seo.iam.gserviceaccount.com
```

The pool and provider live in `metriq-seo`. The provider accepts GitHub OIDC
tokens only when `repository_id` is `1062811894`, `repository_owner_id` is
`174802735`, `ref` is `refs/heads/main`, `environment` is `production`, and
`workflow_ref` is
`ifsp-projects/backend/.github/workflows/cd.yml@refs/heads/main`. It maps
`google.subject=assertion.sub` and the two immutable IDs to attributes. The
deploy service account's `roles/iam.workloadIdentityUser` binding names only
`principalSet://iam.googleapis.com/projects/376622937099/locations/global/workloadIdentityPools/capivara-github/attribute.repository_id/1062811894`.

The deploy account has `roles/storage.objectAdmin` on the existing
`ifsp-extensao-tfstate` bucket and `roles/artifactregistry.writer` on the
existing `ifsp-extensao-repo` repository. It has
`roles/iam.serviceAccountUser` on the VM account
`ifsp-extensao-sa@metriq-seo.iam.gserviceaccount.com`. It also has
`roles/artifactregistry.admin`, `roles/compute.instanceAdmin.v1`,
`roles/compute.networkAdmin`, `roles/compute.securityAdmin`, and
`roles/iam.serviceAccountAdmin` on `metriq-seo` because Terraform creates
repositories, VMs, addresses, firewall rules, and service accounts there.
It also has `roles/resourcemanager.projectIamAdmin` because Terraform manages
the VM account's project-level Artifact Registry reader binding.
Those project grants cover other resources of the same types too; they should
be narrowed further if the stack is isolated into a dedicated project or
resource level IAM becomes available for its create operations.

Before the first run, create the `production` GitHub environment and restrict
deployment to `main`; add required reviewers if available. On 2026-09-28 the
public GitHub API returned no environments for this repository, so protection
has not been verified. Keep the old `GCP_CREDENTIALS` secret until WIF succeeds.
The workflow no longer reads that secret or sets `GOOGLE_CREDENTIALS`.
`google-github-actions/auth@v2` exports a temporary credential file through
`GOOGLE_APPLICATION_CREDENTIALS` for Terraform and `gcloud`.
`gha-creds-*.json` is excluded from Git and the Docker build context.

### Cutover checks

1. Confirm both WIF Actions variables resolve in the `production` job, and
   confirm the environment protection rules. Review the provider condition and
   service account IAM binding above against the expected GitHub OIDC claims.
2. Run the production workflow from `main` only after the complete application
   secret/variable migration above is ready. Check WIF authentication,
   `gcloud auth configure-docker`, Terraform state access, image push, SSH
   deployment, VM pull, API health, OTel export, and dashboard publishing.
3. For a separate pre-deployment infrastructure check, use the WIF identity to
   run `terraform -chdir=tf init`, `terraform -chdir=tf validate`, and
   `terraform -chdir=tf plan -out=production.tfplan` with the same `TF_VAR_*`
   inputs as the workflow. Review `terraform -chdir=tf show production.tfplan`
   for replacements or deletions before any apply. The current workflow still
   uses `terraform apply -auto-approve`; adding a reviewed plan gate is a
   separate deployment safety change.
4. Once WIF deployment succeeds, identify the exact user-managed key behind
   `GCP_CREDENTIALS`, disable that key, and verify another deployment. Then
   delete the GitHub secret and the disabled Google key. Do not disable a key
   based on the service account name alone.

If the WIF path fails before key deletion, restore the previous auth step and
`GOOGLE_CREDENTIALS` on both Terraform steps for a controlled rollback. Keep
the same GCS bucket and prefix; do not migrate state to resolve an auth error.

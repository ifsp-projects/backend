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
- `GCP_CREDENTIALS` — existing Google service account JSON used by GitHub Actions.
- `VM_SSH_KEY` — existing private SSH key for deployment.
- `VM_SSH_PUBLIC_KEY` — public SSH key used by Terraform. This can be moved to a
  variable in a later change; the workflow currently reads it as a secret.
- `AWS_CODEARTIFACT_READ_ROLE_ARN` — existing AWS role ARN. This can likewise be
  moved to a variable later.

## Variables

Store these as Actions variables:

- Existing infrastructure/build settings: `PROJECT_NAME`, `GCP_PROJECT_ID`,
  `REGION`, `ZONE`, `NODE_VERSION`.
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

`GCP_CREDENTIALS` remains a long-lived service account key. A separate follow-up
can replace it with Google Workload Identity Federation after the workload
identity pool, provider, and IAM bindings are configured in GCP.

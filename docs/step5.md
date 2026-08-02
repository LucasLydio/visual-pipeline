# Step 5 - GitHub Webhook Ingestion

## Objective

Allow GitHub push events to queue pipeline runs through the API:

- validate GitHub HMAC signatures
- record webhook deliveries for idempotency
- resolve the synced GitHub project
- select an active pipeline with enabled steps
- queue a `GITHUB_WEBHOOK` pipeline run

This step does not make GitHub call the deploy-agent directly. GitHub calls the API, the API queues a run, and the deploy-agent processes queued runs through the Step 4 contract.

## Domain Rules

- Only signed GitHub webhooks are accepted.
- `GITHUB_WEBHOOK_SECRET` must be configured in the API.
- Duplicate `x-github-delivery` values are ignored.
- Only `push` events queue runs for now.
- Unsupported events are recorded as ignored.
- A project is matched by GitHub repository id first, then repository URL.
- The matched project must be active.
- The selected pipeline must be active and have enabled steps.

## API Route

```text
POST /webhooks/github
```

Required headers:

```text
x-github-event: push
x-github-delivery: <github-delivery-id>
x-hub-signature-256: sha256=<signature>
```

## Local Environment

```bash
GITHUB_WEBHOOK_SECRET=local-webhook-secret
```

For local GitHub testing, expose the API with a tunnel and configure the GitHub webhook URL as:

```text
https://your-tunnel-url/webhooks/github
```

## Done Criteria

- API validates GitHub signatures using the raw request body.
- API records webhook deliveries.
- Duplicate deliveries do not create duplicate runs.
- GitHub `push` can queue a `GITHUB_WEBHOOK` pipeline run.
- Deploy-agent can process that queued run through Step 4.

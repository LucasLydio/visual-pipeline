# Step 4 - Deploy Agent Execution Contract

## Objective

Connect queued pipeline runs to a deploy-agent contract:

- API routes for machine-to-machine job claiming
- API routes for step start/completion
- API route for job completion
- shared token protection for agent routes
- deploy-agent client that can process one queued job on demand

This step proves the execution bridge. It does not clone repositories, execute shell commands, manage secrets, or receive GitHub webhooks yet.

## Domain Rules

- Only requests with `x-agent-token` equal to `AGENT_SHARED_TOKEN` can use agent job routes.
- The agent claims the oldest `QUEUED` pipeline run.
- Claiming a run marks it as `RUNNING`.
- Steps can move from `QUEUED` to `RUNNING`, then to a final state.
- Final step states are `PASSED`, `FAILED`, `SKIPPED`, or `CANCELED`.
- Final job states are `PASSED`, `FAILED`, or `CANCELED`.
- A required step failure marks the job as `FAILED` and skips remaining queued steps.
- The local deploy-agent records command intent only; real shell execution belongs to a later step.

## API Routes

```text
POST  /agent/jobs/claim
PATCH /agent/jobs/:runId/steps/:stepRunId/start
PATCH /agent/jobs/:runId/steps/:stepRunId/complete
PATCH /agent/jobs/:runId/complete
```

Every route requires:

```text
x-agent-token: <AGENT_SHARED_TOKEN>
```

## Deploy Agent Routes

```text
GET  /agent/health
POST /agent/jobs/process-next
```

`POST /agent/jobs/process-next` claims one queued run from the API and marks its steps as passed with a log summary. It is intentionally manual for local testing.

## Local Environment

Set the same token for API and deploy-agent:

```bash
AGENT_SHARED_TOKEN=local-dev-agent-token
VISUAL_PIPELINE_API_URL=http://localhost:3000
```

`VISUAL_PIPELINE_API_URL` is only needed by `apps/deploy-agent`; it defaults to `http://localhost:3000`.

## Done Criteria

- API agent routes are protected by shared token.
- Deploy-agent can claim one queued pipeline run.
- Deploy-agent can mark each step and the final run status.
- OpenAPI includes agent routes.
- No background polling or shell execution is added in this step.

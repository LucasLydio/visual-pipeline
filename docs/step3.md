# Step 3 - Pipeline Runs And Manual Execution History

## Objective

Create the first execution-tracking layer for visual pipelines:

- manual pipeline run creation
- immutable step-run snapshots from enabled pipeline steps
- run history per pipeline
- visual run status on the dashboard

This step records queued runs. It does not execute commands, clone repositories, or contact GitHub Actions yet.

## Domain Rules

- A pipeline run belongs to one project pipeline.
- A run snapshots enabled pipeline steps at trigger time.
- Editing pipeline steps later must not rewrite old run history.
- Only the project owner can manually queue a run.
- Existing projects without an owner use the same team-manager fallback used by pipeline editing.
- Team members can view run history.
- Manual runs start as `QUEUED` until the deploy agent/execution layer is added.

## API Module

```text
src/modules/pipeline-runs/
|-- dto/
|   `-- create-pipeline-run.dto.ts
|-- pipeline-runs.controller.ts
|-- pipeline-runs.service.ts
|-- pipeline-runs.repository.ts
|-- pipeline-runs.module.ts
`-- pipeline-runs.types.ts
```

## Main Routes

```text
POST /pipelines/:pipelineId/runs
GET  /pipelines/:pipelineId/runs
GET  /pipeline-runs/:runId
PATCH /pipeline-runs/:runId/cancel
```

## Example Manual Run

```json
{
  "branch": "main",
  "commitSha": "abc1234"
}
```

Both fields are optional. When `branch` is omitted, the API uses the connected project's default branch.

## Done Criteria

- Prisma schema has pipeline run and step-run models.
- API can queue manual runs from active pipelines.
- API returns run history with step snapshots.
- OpenAPI includes run routes and schemas.
- Web dashboard can queue a run and view run history.
- Web dashboard can cancel queued or running runs.
- Pipeline circles can reflect the latest run status.
- No command execution or webhook ingestion is added in this step.

# Step 6 - Hybrid GitHub Actions Execution

## Objective

Let a synced GitHub project run its pipeline inside GitHub Actions while Visual Pipeline keeps the visual run history:

- generate a project-specific GitHub Actions workflow
- generate and rotate a per-project workflow token
- start a `GITHUB_ACTIONS` pipeline run from the workflow
- report each step status and log summary back to the API
- complete the run with the final GitHub Actions job result

This is the hybrid execution path. The repository runs its own commands in GitHub Actions, and the Visual Pipeline API stores the state.

## Domain Rules

- Workflow setup is only available for active GitHub projects.
- The project must have one active pipeline with enabled steps.
- Project owners can rotate the workflow token. Team managers can rotate it when the project has no strict owner match.
- The token is stored hashed in the database and returned only when rotated.
- The workflow file must use the `VISUAL_PIPELINE_TOKEN` GitHub repository secret.
- Workflow callbacks do not use user sessions; they use project id plus workflow token headers.
- Step callbacks use step order so each workflow run does not need to know internal step-run ids.

## API Routes

Authenticated setup routes:

```text
GET /projects/:projectId/workflow-setup
POST /projects/:projectId/workflow-setup/token
```

GitHub Actions callback routes:

```text
POST /workflow-runs/github/start
PATCH /workflow-runs/:runId/steps/:order/start
PATCH /workflow-runs/:runId/steps/:order/complete
PATCH /workflow-runs/:runId/complete
```

Required callback headers:

```text
x-visual-pipeline-project-id: <project-id>
x-visual-pipeline-token: <project-workflow-token>
```

## Local Environment

Use a public API URL when testing from GitHub Actions:

```bash
PUBLIC_API_BASE_URL=https://your-tunnel-url
```

Then generate the workflow from the dashboard, add `VISUAL_PIPELINE_TOKEN` as a GitHub repository secret, and commit the generated file at:

```text
.github/workflows/visual-pipeline.yml
```

## Done Criteria

- Dashboard can open workflow setup for the selected GitHub project.
- Dashboard can generate or rotate the project workflow token.
- The generated workflow contains the selected project's active pipeline steps.
- GitHub Actions can start a `GITHUB_ACTIONS` run through the API.
- Step status and log summaries are stored in the existing pipeline run history.

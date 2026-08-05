# Visual Pipeline

Visual Pipeline is a monorepo for building a visual software delivery pipeline that helps teams create and operate healthy projects with clear, shared responsibilities.

This README is the live onboarding document for the repository. Update it whenever a workspace, command, port, environment variable, or architectural decision changes.

## Current status

The repository currently includes the monorepo foundation plus the first live product flow:

- Angular web application
- NestJS API
- NestJS deployment agent
- Shared TypeScript contracts
- npm workspaces and root development commands
- Postgres + Prisma persistence for users, teams, projects, sessions, and audit-ready records
- GitHub OAuth login
- Live dashboard API for teams, members, roles, titles, and connected projects
- API and web foundation for reusable pipeline templates and project pipeline steps
- Manual pipeline run history with immutable step-run snapshots
- Deploy-agent polling worker for claiming local-agent queued runs
- GitHub push webhook ingestion for queueing pipeline runs
- Hybrid GitHub Actions workflow setup for selected synced projects

The dashboard can connect projects, organize ownership, define pipeline maps, queue local-agent pipeline runs, and generate a GitHub Actions workflow so a selected repository can execute its own steps and report results back. Project execution is controlled by execution mode: `GITHUB_ACTIONS`, `LOCAL_AGENT`, or `MANUAL`.

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer

The repository is currently verified with Node.js 22 and npm 10.

## Getting started

From the repository root:

```bash
npm install
npm run build
```

Run each application in a separate terminal:

```bash
npm run dev:web
npm run dev:api
npm run dev:agent
```

Or run the compiled local stack in containers:

```bash
copy .env.container.example .env.container
docker compose --env-file .env.container up -d --build
```

Container details are documented in [`docs/containers.md`](docs/containers.md).

## Local services

| Service          | Workspace           | URL                     |
| ---------------- | ------------------- | ----------------------- |
| Web              | `apps/web`          | `http://localhost:4200` |
| API              | `apps/api`          | `http://localhost:3000` |
| Deployment agent | `apps/deploy-agent` | `http://localhost:3001` |

Set `PORT` to override a NestJS service port when needed.

## Web Routes And Live APIs

The Angular workspace currently exposes these main routes:

| Route            | Purpose                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| `/`              | Public landing page with GitHub, GitLab, and Bitbucket entry points       |
| `/auth/callback` | Stores the API session returned after GitHub OAuth                        |
| `/app`           | Live dashboard for teams, members, roles, titles, and synced repositories |

The dashboard uses `TeamApi` from `apps/web/src/app/core/api` and the `HttpTeamApiService` adapter. It calls the NestJS API directly; mock dashboard adapters have been removed.

Synced repositories can be managed from the dashboard modal: update metadata, archive, unarchive, or unsync. Archive is a reversible project status change; unsync deletes the local project record and should stay behind a confirmation dialog.

Set the frontend API base URL in `apps/web/src/environments/environment.ts`. The local default is `http://localhost:3000`.

The API exposes a frontend-optimized `GET /workspace/dashboard` endpoint so the dashboard can load the current user, active team, members, and projects with one request instead of reaching repeatedly into team and project routes.

Pipeline runs are available from the dashboard after selecting a pipeline. `POST /pipelines/:pipelineId/runs` queues a run and snapshots enabled steps. Run history is read from `GET /pipelines/:pipelineId/runs`, while the dashboard polls `GET /pipeline-runs/:runId/status` for the active run so status changes can update with motion.

## Local Auth Setup

For GitHub login, configure `apps/api/.env`:

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
FRONTEND_ORIGIN=http://localhost:4200
FRONTEND_AUTH_CALLBACK_URL=http://localhost:4200/auth/callback
AGENT_SHARED_TOKEN=local-dev-agent-token
GITHUB_WEBHOOK_SECRET=local-webhook-secret
PUBLIC_API_BASE_URL=https://your-public-api-url
DATABASE_CONNECTION_SOURCE=local
OAUTH_TOKEN_ENCRYPTION_SECRET=change-me-for-local-development
```

After changing API environment values, restart `npm run dev:api`.

Repository selection uses the connected GitHub account and requires the OAuth `repo` scope. If you logged in before this scope was added, sign out and sign in with GitHub again so the API can list the repositories available to your account.

For the deploy-agent, configure:

```bash
AGENT_SHARED_TOKEN=local-dev-agent-token
VISUAL_PIPELINE_API_URL=http://localhost:3000
LOCAL_AGENT_WORKSPACE_ROOT=C:\Users\Winner\Documents\Projetos
AGENT_POLL_ENABLED=true
AGENT_POLL_INTERVAL_MS=5000
```

The deploy-agent can poll automatically or expose `POST /agent/jobs/process-next` locally for manual processing. It claims queued runs for projects using `LOCAL_AGENT` execution mode, executes each step command inside `LOCAL_AGENT_WORKSPACE_ROOT/<project-slug>`, and reports the result back to the API. Docker deployment is just a pipeline command, for example `docker compose up -d --build`, when the target project has the required Docker files.

GitHub webhooks should point to the API:

```text
POST http://localhost:3000/webhooks/github
```

For real GitHub delivery, expose the API with a tunnel and configure the same `GITHUB_WEBHOOK_SECRET` in GitHub and `apps/api/.env`.

Hybrid GitHub Actions execution is configured from the dashboard after selecting a GitHub project with an active pipeline. Use the Workflow button to generate:

- `.github/workflows/visual-pipeline.yml`
- the `VISUAL_PIPELINE_TOKEN` GitHub repository secret

The generated workflow calls the API through `PUBLIC_API_BASE_URL`, starts a `GITHUB_ACTIONS` run, reports each step by order, and writes log summaries to the existing run history.

## Workspace commands

| Command                                                | Purpose                                            |
| ------------------------------------------------------ | -------------------------------------------------- |
| `npm run dev:web`                                      | Start Angular in development mode                  |
| `npm run dev:api`                                      | Start the API with watch mode                      |
| `npm run dev:agent`                                    | Start the deployment agent with watch mode         |
| `npm run build`                                        | Build every workspace that provides a build script |
| `npm run test`                                         | Test every workspace that provides a test script   |
| `npm run lint`                                         | Lint every workspace that provides a lint script   |
| `npm run build --workspace=@visual-pipeline/contracts` | Build only the shared contracts                    |
| `npm run test:container`                               | Passing placeholder for future container tests     |

Step 1 has no product behavior to test yet, so generated placeholder specs were removed. The NestJS test commands allow an empty suite, while the Angular `test` script should be added with the first real Angular test because its builder rejects an empty suite.

## Repository layout

```text
visual-pipeline/
|-- apps/
|   |-- api/              NestJS API
|   |-- deploy-agent/     NestJS deployment agent
|   `-- web/              Angular frontend
|-- docs/                 Ordered implementation steps
|-- infrastructure/       Infrastructure definitions added by later steps
|-- packages/
|   `-- contracts/        Shared TypeScript contracts
|-- templates/            Project and pipeline templates added by later steps
|-- tests/                Cross-workspace and system tests
|-- package.json
`-- README.md
```

## Development rules

1. Follow the implementation steps in `docs/` in order.
2. Keep changes within the scope of the current documented step.
3. Run `npm run build` before handing work to another developer.
4. Add focused tests when behavior is introduced or changed.
5. Update this README in the same change whenever onboarding information changes.
6. Do not commit generated `dist`, coverage, local environment, or editor files.

## Step 1 verification

```bash
npm install
npm run build
npm run dev:web
npm run dev:api
npm run dev:agent
npm run build --workspace=@visual-pipeline/contracts
```

Expected results are documented in [`docs/step1.md`](docs/step1.md).

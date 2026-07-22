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
- API foundation for reusable pipeline templates and project pipeline steps

Deployment execution is still outside the current scope. The dashboard can connect projects, organize ownership, and define pipeline maps, but real execution/webhook ingestion should be added in a later documented step.

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

## Local services

| Service | Workspace | URL |
| --- | --- | --- |
| Web | `apps/web` | `http://localhost:4200` |
| API | `apps/api` | `http://localhost:3000` |
| Deployment agent | `apps/deploy-agent` | `http://localhost:3001` |

Set `PORT` to override a NestJS service port when needed.

## Web Routes And Live APIs

The Angular workspace currently exposes these main routes:

| Route | Purpose |
| --- | --- |
| `/` | Public landing page with GitHub, GitLab, and Bitbucket entry points |
| `/auth/callback` | Stores the API session returned after GitHub OAuth |
| `/app` | Live dashboard for teams, members, roles, titles, and synced repositories |

The dashboard uses `TeamApi` from `apps/web/src/app/core/api` and the `HttpTeamApiService` adapter. It calls the NestJS API directly; mock dashboard adapters have been removed.

Synced repositories can be managed from the dashboard modal: update metadata, archive, unarchive, or unsync. Archive is a reversible project status change; unsync deletes the local project record and should stay behind a confirmation dialog.

Set the frontend API base URL in `apps/web/src/environments/environment.ts`. The local default is `http://localhost:3000`.

The API exposes a frontend-optimized `GET /workspace/dashboard` endpoint so the dashboard can load the current user, active team, members, and projects with one request instead of reaching repeatedly into team and project routes.

## Local Auth Setup

For GitHub login, configure `apps/api/.env`:

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
FRONTEND_ORIGIN=http://localhost:4200
FRONTEND_AUTH_CALLBACK_URL=http://localhost:4200/auth/callback
```

After changing API environment values, restart `npm run dev:api`.

## Workspace commands

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start Angular in development mode |
| `npm run dev:api` | Start the API with watch mode |
| `npm run dev:agent` | Start the deployment agent with watch mode |
| `npm run build` | Build every workspace that provides a build script |
| `npm run test` | Test every workspace that provides a test script |
| `npm run lint` | Lint every workspace that provides a lint script |
| `npm run build --workspace=@visual-pipeline/contracts` | Build only the shared contracts |

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

# Visual Pipeline

Visual Pipeline is a monorepo for building a visual software delivery pipeline that helps teams create and operate healthy projects with clear, shared responsibilities.

This README is the live onboarding document for the repository. Update it whenever a workspace, command, port, environment variable, or architectural decision changes.

## Current status

Step 1 establishes the monorepo foundation:

- Angular web application
- NestJS API
- NestJS deployment agent
- Shared TypeScript contracts
- npm workspaces and root development commands

The current scope intentionally contains no database, Redis, GitHub App, or deployment logic. Those capabilities belong in later documented steps.

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

## Web routes and mock APIs

The Angular workspace currently exposes two routes:

| Route | Purpose |
| --- | --- |
| `/` | Public landing page and mock early-access form |
| `/app` | Visual Pipeline delivery dashboard |

UI features depend on the abstract `PipelineApi` and `LeadApi` contracts under `apps/web/src/app/core/api`. The application configuration currently injects mock adapters from `core/testing`; replace those providers with HTTP adapters when the backend contracts are ready.

The dashboard's **Mock scenario** selector can load healthy, degraded, incident, empty, and API-offline states. Every mock request includes a short delay so loading and error handling can be exercised in the browser.

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
npm run start --workspace=apps/web
npm run start:dev --workspace=apps/api
npm run start:dev --workspace=apps/deploy-agent
npm run build --workspace=@visual-pipeline/contracts
```

Expected results are documented in [`docs/step1.md`](docs/step1.md).

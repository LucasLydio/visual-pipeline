# Container Operations

This stack runs the main Visual Pipeline ports without keeping several watch-mode terminals open.

It is designed for local product testing and SRE-style operational discipline:

- one Compose entrypoint from the repository root
- services run detached
- containers restart unless stopped
- database and app health checks are explicit
- Postgres state is stored in a named volume
- API migrations run before the API starts
- tests have a pass-through container until real smoke/e2e tests are built

## Services

| Service        | Container role                     | Host URL                |
| -------------- | ---------------------------------- | ----------------------- |
| `web`          | Nginx serving the Angular build    | `http://localhost:4200` |
| `api`          | NestJS API running compiled code   | `http://localhost:3000` |
| `deploy-agent` | NestJS agent running compiled code | `http://localhost:3001` |
| `postgres`     | PostgreSQL 17                      | `localhost:5432`        |

The stack uses production-like compiled builds instead of Angular/Nest watch mode. That is intentional: watch mode is convenient while editing, but it costs more CPU.

## First Run

Start Docker Desktop before running the stack. On Windows, the Linux engine must be running or Compose builds will fail while connecting to `dockerDesktopLinuxEngine`.

From the repository root:

```bash
copy .env.container.example .env.container
docker compose --env-file .env.container build
docker compose --env-file .env.container up -d
```

Then open:

```text
http://localhost:4200
```

## GitHub OAuth And Webhooks

Edit `.env.container` and set:

```bash
DATABASE_CONNECTION_SOURCE=local
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
GITHUB_WEBHOOK_SECRET=your_webhook_secret
PUBLIC_API_BASE_URL=http://localhost:3000
```

For real GitHub webhooks or GitHub Actions callbacks, `PUBLIC_API_BASE_URL` must be reachable by GitHub. In local testing, use a tunnel URL instead of `localhost`.

For cloud database testing, set:

```bash
DATABASE_CONNECTION_SOURCE=cloud
CLOUD_PROVIDER=aws
```

`CLOUD_PROVIDER` accepts `aws`, `gcp`, or `azure`.

## Local Agent Projects

Local-agent projects are resolved by slug under the mounted workspace folder:

```bash
LOCAL_AGENT_HOST_WORKSPACE_ROOT=./.local-projects
LOCAL_AGENT_STEP_TIMEOUT_MS=600000
```

A project with slug `checkout-api` must exist at:

```text
.local-projects/checkout-api
```

The agent runs pipeline step commands inside that folder. If a step deploys Docker, for example:

```bash
docker compose up -d --build
```

then the target project must provide its own `Dockerfile` or Compose file. The container stack mounts the Docker socket into the agent for local development, which allows the agent to control the host Docker engine.

## Daily Commands

Start the stack:

```bash
docker compose --env-file .env.container up -d
```

Check service health:

```bash
docker compose --env-file .env.container ps
```

Follow logs:

```bash
docker compose --env-file .env.container logs -f api
docker compose --env-file .env.container logs -f web
docker compose --env-file .env.container logs -f deploy-agent
```

Rebuild after code changes:

```bash
docker compose --env-file .env.container up -d --build
```

Stop containers but keep database data:

```bash
docker compose --env-file .env.container down
```

Stop containers and remove local database data:

```bash
docker compose --env-file .env.container down -v
```

## Test Step

Until container smoke/e2e tests are added, the stack includes a passing placeholder:

```bash
docker compose --env-file .env.container --profile test run --rm tests
```

This runs `npm run test:container`, which currently exits successfully with a clear message. Replace it with real container tests once the product workflows stabilize.

## Operational Notes

- `api` waits for `postgres` to be healthy.
- `web` and `deploy-agent` wait for the API health check.
- The API runs `prisma migrate deploy` before `node dist/main`.
- Local containers use `DATABASE_CONNECTION_SOURCE=local` even though the API runs compiled production code.
- The browser still calls `http://localhost:3000` because Angular is served to the host browser.
- The deploy-agent calls the API through the internal Compose DNS name: `http://api:3000`.
- The deploy-agent executes local-agent commands from `/local-projects/<project-slug>`.
- Secrets should live in `.env.container`, never inside committed workflow files or source code.

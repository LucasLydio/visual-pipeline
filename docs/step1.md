# Step 1 — Create the Visual Pipeline Monorepo

## Objective

Create the initial monorepo structure for `visual-pipeline` with:

- Angular frontend
- NestJS API
- NestJS deployment agent
- Shared TypeScript contracts
- npm workspaces

At the end of this step, every application should build independently.

---

## 1. Create the root project

```bash
mkdir visual-pipeline
cd visual-pipeline

npm init -y
```

Update the root `package.json`:

```json
{
  "name": "visual-pipeline",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  }
}
```

---

## 2. Create the base folders

```bash
mkdir apps
mkdir packages
mkdir docs
mkdir infrastructure
mkdir templates
mkdir tests
```

Expected structure:

```text
visual-pipeline/
├── apps/
├── packages/
├── docs/
├── infrastructure/
├── templates/
├── tests/
└── package.json
```

---

## 3. Create the Angular frontend

From the project root:

```bash
npx @angular/cli new web   --directory apps/web   --standalone   --routing   --style css   --skip-git   --package-manager npm
```

Run the frontend:

```bash
npm run start --workspace=apps/web
```

Open:

```text
http://localhost:4200
```

---

## 4. Create the NestJS API

```bash
npx @nestjs/cli new apps/api   --package-manager npm   --skip-git
```

Run the API:

```bash
npm run start:dev --workspace=apps/api
```

Default URL:

```text
http://localhost:3000
```

---

## 5. Create the deployment agent

```bash
npx @nestjs/cli new apps/deploy-agent   --package-manager npm   --skip-git
```

Change its development port later to avoid conflicting with the API.

For now, update `apps/deploy-agent/src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
```

Run the agent:

```bash
npm run start:dev --workspace=apps/deploy-agent
```

Default URL:

```text
http://localhost:3001
```

---

## 6. Create the shared contracts package

Create:

```text
packages/contracts/
├── src/
│   ├── pipeline/
│   │   ├── pipeline-event.ts
│   │   └── pipeline-status.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### `packages/contracts/package.json`

```json
{
  "name": "@visual-pipeline/contracts",
  "version": "1.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "typescript": "^5.8.0"
  }
}
```

### `packages/contracts/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*.ts"
  ]
}
```

### `packages/contracts/src/pipeline/pipeline-status.ts`

```ts
export type PipelineStatus =
  | 'pending'
  | 'queued'
  | 'running'
  | 'success'
  | 'warning'
  | 'failed'
  | 'cancelled'
  | 'skipped';
```

### `packages/contracts/src/pipeline/pipeline-event.ts`

```ts
import type { PipelineStatus } from './pipeline-status';

export interface PipelineEvent {
  pipelineId: string;
  stepId: string;
  stepName: string;
  status: PipelineStatus;
  message?: string;
  occurredAt: string;
}
```

### `packages/contracts/src/index.ts`

```ts
export type { PipelineStatus } from './pipeline/pipeline-status';
export type { PipelineEvent } from './pipeline/pipeline-event';
```

Install root dependencies:

```bash
npm install
```

Build the contracts:

```bash
npm run build --workspace=@visual-pipeline/contracts
```

---

## 7. Add root development scripts

Update the root `package.json` scripts:

```json
{
  "scripts": {
    "dev:web": "npm run start --workspace=apps/web",
    "dev:api": "npm run start:dev --workspace=apps/api",
    "dev:agent": "npm run start:dev --workspace=apps/deploy-agent",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present"
  }
}
```

---

## 8. Create the root `.gitignore`

```gitignore
node_modules/
dist/
coverage/
.angular/
.env
.env.*
!.env.example
*.log
.DS_Store
.vscode/
.idea/
```

---

## Final structure

```text
visual-pipeline/
├── apps/
│   ├── web/
│   ├── api/
│   └── deploy-agent/
├── packages/
│   └── contracts/
├── docs/
├── infrastructure/
├── templates/
├── tests/
├── .gitignore
├── package-lock.json
└── package.json
```

---

## Validation checklist

Run:

```bash
npm install
npm run build
```

Then verify individually:

```bash
npm run start --workspace=apps/web
npm run start:dev --workspace=apps/api
npm run start:dev --workspace=apps/deploy-agent
npm run build --workspace=@visual-pipeline/contracts
```

Expected results:

- Angular runs on port `4200`
- NestJS API runs on port `3000`
- Deployment agent runs on port `3001`
- Shared contracts compile into `packages/contracts/dist`
- Root workspace commands execute without dependency errors

---

## Done criteria

Step 1 is complete when:

- The monorepo exists
- All three applications start successfully
- The shared contracts package builds successfully
- The root `npm run build` command succeeds
- No database, Redis, GitHub App or deployment logic has been added yet

# Step 2 - Pipeline Templates And Project Steps

## Objective

Create the API foundation for visual pipeline planning:

- reusable team pipeline templates
- ordered template steps
- project pipelines created from templates or from scratch
- ordered project pipeline steps
- project-owner permissions for editing applied pipelines

This step defines the pipeline map. It does not execute deployments yet.

## Domain Rules

- A project can have many pipelines.
- A pipeline can be created from a reusable team template.
- Templates are reusable recommendations, not mandatory boilerplates.
- Steps can be required or optional.
- Steps can be enabled or disabled.
- A step can have no command, so it can act as a planning/checklist item.
- Team members can view templates and project pipelines.
- Team managers can manage team templates.
- Only the project owner can manage project pipelines.
- Existing projects without an owner use a team-manager fallback until ownership is assigned.

## API Modules

```text
src/modules/pipelines/
|-- dto/
|   |-- create-pipeline.dto.ts
|   |-- update-pipeline.dto.ts
|   |-- create-pipeline-step.dto.ts
|   |-- update-pipeline-step.dto.ts
|   |-- create-pipeline-template.dto.ts
|   |-- update-pipeline-template.dto.ts
|   |-- create-pipeline-template-step.dto.ts
|   `-- update-pipeline-template-step.dto.ts
|-- pipelines.controller.ts
|-- pipelines.service.ts
|-- pipelines.repository.ts
|-- pipelines.module.ts
`-- pipelines.types.ts
```

## Main Routes

```text
GET    /teams/:teamId/pipeline-templates
POST   /teams/:teamId/pipeline-templates
GET    /pipeline-templates/:templateId
PATCH  /pipeline-templates/:templateId
DELETE /pipeline-templates/:templateId

POST   /pipeline-templates/:templateId/steps
PATCH  /pipeline-template-steps/:stepId
DELETE /pipeline-template-steps/:stepId

GET    /projects/:projectId/pipelines
POST   /projects/:projectId/pipelines
GET    /pipelines/:pipelineId
PATCH  /pipelines/:pipelineId
DELETE /pipelines/:pipelineId

POST   /pipelines/:pipelineId/steps
PATCH  /pipeline-steps/:stepId
DELETE /pipeline-steps/:stepId
```

## Example Template

```json
{
  "name": "Node.js API",
  "description": "Recommended delivery map for a Node API.",
  "steps": [
    {
      "name": "Install dependencies",
      "order": 1,
      "command": "npm ci",
      "isRequired": true,
      "isEnabled": true
    },
    {
      "name": "Run lint",
      "order": 2,
      "command": "npm run lint",
      "isRequired": false,
      "isEnabled": true
    },
    {
      "name": "Run tests",
      "order": 3,
      "command": "npm test",
      "isRequired": false,
      "isEnabled": true
    },
    {
      "name": "Build",
      "order": 4,
      "command": "npm run build",
      "isRequired": true,
      "isEnabled": true
    }
  ]
}
```

## Done Criteria

- Prisma schema has project ownership and pipeline template models.
- Project creation stores the current user as owner.
- Pipeline API builds successfully.
- OpenAPI includes pipeline routes and schemas.
- No deployment execution is added in this step.

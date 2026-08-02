import type { OpenApiSchema } from './openapi.types.js';

const stepFields = {
  name: { type: 'string', minLength: 2, maxLength: 120 },
  order: { type: 'integer', minimum: 1 },
  command: { type: 'string', nullable: true },
  isRequired: { type: 'boolean', example: true },
  isEnabled: { type: 'boolean', example: true },
};

export const pipelineSchemas: Record<string, OpenApiSchema> = {
  PipelineStatus: {
    type: 'string',
    enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
  },
  PipelineRunStatus: {
    type: 'string',
    enum: ['QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED', 'CANCELED'],
  },
  PipelineRunTrigger: {
    type: 'string',
    enum: ['MANUAL', 'GITHUB_WEBHOOK', 'GITHUB_ACTIONS', 'AGENT', 'SCHEDULED'],
  },
  PipelineStepRunStatus: {
    type: 'string',
    enum: ['QUEUED', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED', 'CANCELED'],
  },
  PipelineTemplateStep: {
    type: 'object',
    required: ['id', 'templateId', 'name', 'order', 'isRequired', 'isEnabled'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      templateId: { type: 'string', format: 'uuid' },
      ...stepFields,
      description: { type: 'string', nullable: true, maxLength: 240 },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  PipelineTemplate: {
    type: 'object',
    required: ['id', 'teamId', 'createdById', 'name', 'isActive', 'steps'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      teamId: { type: 'string', format: 'uuid' },
      createdById: { type: 'string', format: 'uuid' },
      name: { type: 'string', example: 'Node.js API' },
      description: { type: 'string', nullable: true },
      isActive: { type: 'boolean' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      steps: {
        type: 'array',
        items: { $ref: '#/components/schemas/PipelineTemplateStep' },
      },
    },
  },
  PipelineTemplateList: {
    type: 'array',
    items: { $ref: '#/components/schemas/PipelineTemplate' },
  },
  CreatePipelineTemplateStepRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      ...stepFields,
      description: { type: 'string', maxLength: 240 },
    },
  },
  UpdatePipelineTemplateStepRequest: {
    type: 'object',
    properties: {
      ...stepFields,
      description: { type: 'string', nullable: true, maxLength: 240 },
    },
  },
  CreatePipelineTemplateRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 140 },
      description: { type: 'string', maxLength: 240 },
      steps: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CreatePipelineTemplateStepRequest',
        },
      },
    },
  },
  UpdatePipelineTemplateRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 140 },
      description: { type: 'string', nullable: true, maxLength: 240 },
      isActive: { type: 'boolean' },
    },
  },
  PipelineStep: {
    type: 'object',
    required: ['id', 'pipelineId', 'name', 'order', 'isRequired', 'isEnabled'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      pipelineId: { type: 'string', format: 'uuid' },
      ...stepFields,
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  Pipeline: {
    type: 'object',
    required: ['id', 'projectId', 'name', 'status', 'steps'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      projectId: { type: 'string', format: 'uuid' },
      templateId: { type: 'string', format: 'uuid', nullable: true },
      name: { type: 'string', example: 'Production deploy' },
      description: { type: 'string', nullable: true },
      status: { $ref: '#/components/schemas/PipelineStatus' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      steps: {
        type: 'array',
        items: { $ref: '#/components/schemas/PipelineStep' },
      },
    },
  },
  PipelineList: {
    type: 'array',
    items: { $ref: '#/components/schemas/Pipeline' },
  },
  CreatePipelineStepRequest: {
    type: 'object',
    required: ['name'],
    properties: stepFields,
  },
  UpdatePipelineStepRequest: {
    type: 'object',
    properties: stepFields,
  },
  CreatePipelineRequest: {
    type: 'object',
    properties: {
      templateId: { type: 'string', format: 'uuid' },
      name: { type: 'string', minLength: 2, maxLength: 140 },
      description: { type: 'string', maxLength: 240 },
      steps: {
        type: 'array',
        items: { $ref: '#/components/schemas/CreatePipelineStepRequest' },
      },
    },
  },
  UpdatePipelineRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 140 },
      description: { type: 'string', nullable: true, maxLength: 240 },
      status: { $ref: '#/components/schemas/PipelineStatus' },
    },
  },
  PipelineRunActor: {
    type: 'object',
    required: ['id', 'email', 'displayName'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string' },
    },
  },
  PipelineStepRun: {
    type: 'object',
    required: ['id', 'pipelineRunId', 'name', 'order', 'isRequired', 'status'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      pipelineRunId: { type: 'string', format: 'uuid' },
      pipelineStepId: { type: 'string', format: 'uuid', nullable: true },
      name: { type: 'string' },
      order: { type: 'integer' },
      command: { type: 'string', nullable: true },
      isRequired: { type: 'boolean' },
      status: { $ref: '#/components/schemas/PipelineStepRunStatus' },
      logsSummary: { type: 'string', nullable: true },
      startedAt: { type: 'string', format: 'date-time', nullable: true },
      finishedAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  PipelineRun: {
    type: 'object',
    required: ['id', 'pipelineId', 'status', 'trigger', 'branch', 'steps'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      pipelineId: { type: 'string', format: 'uuid' },
      triggeredById: { type: 'string', format: 'uuid', nullable: true },
      status: { $ref: '#/components/schemas/PipelineRunStatus' },
      trigger: { $ref: '#/components/schemas/PipelineRunTrigger' },
      branch: { type: 'string' },
      commitSha: { type: 'string', nullable: true },
      externalRunId: { type: 'string', nullable: true },
      externalRunUrl: { type: 'string', nullable: true },
      runnerName: { type: 'string', nullable: true },
      failureReason: { type: 'string', nullable: true },
      queuedAt: { type: 'string', format: 'date-time' },
      startedAt: { type: 'string', format: 'date-time', nullable: true },
      finishedAt: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      triggeredBy: {
        $ref: '#/components/schemas/PipelineRunActor',
        nullable: true,
      },
      steps: {
        type: 'array',
        items: { $ref: '#/components/schemas/PipelineStepRun' },
      },
    },
  },
  PipelineRunList: {
    type: 'array',
    items: { $ref: '#/components/schemas/PipelineRun' },
  },
  CreatePipelineRunRequest: {
    type: 'object',
    properties: {
      branch: { type: 'string', maxLength: 120 },
      commitSha: { type: 'string', minLength: 7, maxLength: 64 },
    },
  },
  CompleteAgentStepRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['PASSED', 'FAILED', 'SKIPPED', 'CANCELED'],
      },
      logsSummary: { type: 'string', nullable: true },
    },
  },
  CompleteAgentJobRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['PASSED', 'FAILED', 'CANCELED'] },
      failureReason: { type: 'string', nullable: true, maxLength: 240 },
    },
  },
  WebhookResult: {
    type: 'object',
    required: ['status', 'message'],
    properties: {
      status: { type: 'string', enum: ['processed', 'ignored'] },
      message: { type: 'string' },
      runId: { type: 'string', format: 'uuid' },
    },
  },
  WorkflowSetup: {
    type: 'object',
    required: [
      'projectId',
      'enabled',
      'secretName',
      'workflowPath',
      'apiBaseUrl',
      'workflowYaml',
    ],
    properties: {
      projectId: { type: 'string', format: 'uuid' },
      enabled: { type: 'boolean' },
      secretName: { type: 'string', example: 'VISUAL_PIPELINE_TOKEN' },
      workflowPath: {
        type: 'string',
        example: '.github/workflows/visual-pipeline.yml',
      },
      apiBaseUrl: { type: 'string', example: 'https://api.example.com' },
      workflowYaml: { type: 'string' },
      workflowToken: { type: 'string' },
    },
  },
  StartWorkflowRunRequest: {
    type: 'object',
    properties: {
      branch: { type: 'string', maxLength: 120 },
      commitSha: { type: 'string', minLength: 7, maxLength: 64 },
      externalRunId: { type: 'string', maxLength: 120 },
      externalRunUrl: { type: 'string', maxLength: 2048 },
      runnerName: { type: 'string', maxLength: 120 },
    },
  },
  WorkflowRunStartResponse: {
    type: 'object',
    required: ['runId', 'message'],
    properties: {
      runId: { type: 'string', format: 'uuid' },
      message: { type: 'string' },
    },
  },
  CompleteWorkflowStepRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: ['PASSED', 'FAILED', 'SKIPPED', 'CANCELED'],
      },
      logsSummary: { type: 'string', nullable: true },
    },
  },
  CompleteWorkflowRunRequest: {
    type: 'object',
    required: ['status'],
    properties: {
      status: { type: 'string', enum: ['PASSED', 'FAILED', 'CANCELED'] },
      failureReason: { type: 'string', nullable: true, maxLength: 240 },
    },
  },
};

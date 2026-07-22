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
};

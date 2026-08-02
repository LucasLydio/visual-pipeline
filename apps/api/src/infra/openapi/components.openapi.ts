import type { OpenApiComponents } from './openapi.types.js';

export const openApiComponents: OpenApiComponents = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'opaque-session-token',
    },
  },
  parameters: {
    UserId: {
      name: 'id',
      in: 'path',
      required: true,
      description: 'User identifier.',
      schema: { type: 'string', format: 'uuid' },
      example: '4a5a58a0-8f11-44c3-9f5c-4f470f5e38f3',
    },
    UserSearch: {
      name: 'search',
      in: 'query',
      required: false,
      description: 'Optional case-insensitive search by email or display name.',
      schema: { type: 'string' },
      example: 'dev.team',
    },
    TeamId: {
      name: 'teamId',
      in: 'path',
      required: true,
      description: 'Team identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    MemberId: {
      name: 'memberId',
      in: 'path',
      required: true,
      description: 'Team member identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    ProjectId: {
      name: 'projectId',
      in: 'path',
      required: true,
      description: 'Project identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    PipelineTemplateId: {
      name: 'templateId',
      in: 'path',
      required: true,
      description: 'Pipeline template identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    PipelineId: {
      name: 'pipelineId',
      in: 'path',
      required: true,
      description: 'Pipeline identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    PipelineStepId: {
      name: 'stepId',
      in: 'path',
      required: true,
      description: 'Pipeline or template step identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    PipelineRunId: {
      name: 'runId',
      in: 'path',
      required: true,
      description: 'Pipeline run identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    PipelineStepRunId: {
      name: 'stepRunId',
      in: 'path',
      required: true,
      description: 'Pipeline step run identifier.',
      schema: { type: 'string', format: 'uuid' },
    },
    AgentToken: {
      name: 'x-agent-token',
      in: 'header',
      required: true,
      description: 'Shared deploy-agent token.',
      schema: { type: 'string' },
    },
    GitHubEvent: {
      name: 'x-github-event',
      in: 'header',
      required: true,
      description: 'GitHub webhook event name.',
      schema: { type: 'string' },
    },
    GitHubDelivery: {
      name: 'x-github-delivery',
      in: 'header',
      required: true,
      description: 'GitHub webhook delivery id.',
      schema: { type: 'string' },
    },
    GitHubSignature256: {
      name: 'x-hub-signature-256',
      in: 'header',
      required: true,
      description: 'GitHub HMAC SHA-256 signature.',
      schema: { type: 'string' },
    },
    Search: {
      name: 'search',
      in: 'query',
      required: false,
      description: 'Optional case-insensitive search.',
      schema: { type: 'string' },
    },
  },
  responses: {
    BadRequest: {
      description: 'Invalid request payload.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    Unauthorized: {
      description: 'Missing, invalid, or expired authentication.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    NotFound: {
      description: 'Resource not found.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    Conflict: {
      description: 'Request conflicts with existing data.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    ServiceUnavailable: {
      description: 'Required infrastructure is unavailable.',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
  },
};

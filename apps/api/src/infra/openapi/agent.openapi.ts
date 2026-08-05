import type { OpenApiPaths } from './openapi.types.js';

const response = (
  schema: string,
  description: string,
): Record<string, unknown> => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

export const agentPaths: OpenApiPaths = {
  '/agent/jobs/claim': {
    post: {
      tags: ['Agent'],
      summary: 'Claim the next queued pipeline run for processing.',
      operationId: 'claimAgentJob',
      parameters: [{ $ref: '#/components/parameters/AgentToken' }],
      responses: {
        '201': response(
          'PipelineRun',
          'Pipeline run claimed, or null if none are queued.',
        ),
      },
    },
  },
  '/agent/jobs/{runId}/steps/{stepRunId}/start': {
    patch: {
      tags: ['Agent'],
      summary: 'Mark a pipeline step run as running.',
      operationId: 'startAgentStep',
      parameters: [
        { $ref: '#/components/parameters/PipelineRunId' },
        { $ref: '#/components/parameters/PipelineStepRunId' },
        { $ref: '#/components/parameters/AgentToken' },
      ],
      responses: { '200': response('PipelineStepRun', 'Step run started.') },
    },
  },
  '/agent/jobs/{runId}/steps/{stepRunId}/complete': {
    patch: {
      tags: ['Agent'],
      summary: 'Complete a pipeline step run.',
      operationId: 'completeAgentStep',
      parameters: [
        { $ref: '#/components/parameters/PipelineRunId' },
        { $ref: '#/components/parameters/PipelineStepRunId' },
        { $ref: '#/components/parameters/AgentToken' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CompleteAgentStepRequest' },
          },
        },
      },
      responses: { '200': response('PipelineStepRun', 'Step run completed.') },
    },
  },
  '/agent/jobs/{runId}/steps/{stepRunId}/logs': {
    patch: {
      tags: ['Agent'],
      summary: 'Update live logs for a running pipeline step.',
      operationId: 'updateAgentStepLogs',
      parameters: [
        { $ref: '#/components/parameters/PipelineRunId' },
        { $ref: '#/components/parameters/PipelineStepRunId' },
        { $ref: '#/components/parameters/AgentToken' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateAgentStepLogsRequest' },
          },
        },
      },
      responses: { '200': response('PipelineStepRun', 'Step logs updated.') },
    },
  },
  '/agent/jobs/{runId}/complete': {
    patch: {
      tags: ['Agent'],
      summary: 'Complete a pipeline run.',
      operationId: 'completeAgentJob',
      parameters: [
        { $ref: '#/components/parameters/PipelineRunId' },
        { $ref: '#/components/parameters/AgentToken' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CompleteAgentJobRequest' },
          },
        },
      },
      responses: { '200': response('PipelineRun', 'Pipeline run completed.') },
    },
  },
};

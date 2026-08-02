import type { OpenApiPaths } from './openapi.types.js';

const jsonResponse = (
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

const workflowHeaders = [
  { $ref: '#/components/parameters/VisualPipelineProjectId' },
  { $ref: '#/components/parameters/VisualPipelineToken' },
];

export const workflowPaths: OpenApiPaths = {
  '/projects/{projectId}/workflow-setup': {
    get: {
      tags: ['Workflows'],
      summary: 'Get the generated GitHub Actions workflow for a project.',
      operationId: 'getProjectWorkflowSetup',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      responses: {
        '200': jsonResponse('WorkflowSetup', 'Workflow setup returned.'),
      },
    },
  },
  '/projects/{projectId}/workflow-setup/token': {
    post: {
      tags: ['Workflows'],
      summary: 'Rotate the project workflow token and return it once.',
      operationId: 'rotateProjectWorkflowToken',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      responses: {
        '201': jsonResponse('WorkflowSetup', 'Workflow token created.'),
      },
    },
  },
  '/workflow-runs/github/start': {
    post: {
      tags: ['Workflows'],
      summary: 'Start a pipeline run from a GitHub Actions workflow.',
      operationId: 'startGitHubActionsWorkflowRun',
      parameters: workflowHeaders,
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/StartWorkflowRunRequest' },
          },
        },
      },
      responses: {
        '201': jsonResponse(
          'WorkflowRunStartResponse',
          'Workflow run started.',
        ),
      },
    },
  },
  '/workflow-runs/{runId}/steps/{order}/start': {
    patch: {
      tags: ['Workflows'],
      summary: 'Mark one workflow step as running.',
      operationId: 'startGitHubActionsWorkflowStep',
      parameters: [
        { $ref: '#/components/parameters/PipelineRunId' },
        { $ref: '#/components/parameters/WorkflowStepOrder' },
        ...workflowHeaders,
      ],
      responses: {
        '200': jsonResponse('PipelineStepRun', 'Workflow step started.'),
      },
    },
  },
  '/workflow-runs/{runId}/steps/{order}/complete': {
    patch: {
      tags: ['Workflows'],
      summary: 'Complete one workflow step.',
      operationId: 'completeGitHubActionsWorkflowStep',
      parameters: [
        { $ref: '#/components/parameters/PipelineRunId' },
        { $ref: '#/components/parameters/WorkflowStepOrder' },
        ...workflowHeaders,
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CompleteWorkflowStepRequest',
            },
          },
        },
      },
      responses: {
        '200': jsonResponse('PipelineStepRun', 'Workflow step completed.'),
      },
    },
  },
  '/workflow-runs/{runId}/complete': {
    patch: {
      tags: ['Workflows'],
      summary: 'Complete a GitHub Actions pipeline run.',
      operationId: 'completeGitHubActionsWorkflowRun',
      parameters: [
        { $ref: '#/components/parameters/PipelineRunId' },
        ...workflowHeaders,
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CompleteWorkflowRunRequest' },
          },
        },
      },
      responses: {
        '200': jsonResponse('PipelineRun', 'Workflow run completed.'),
      },
    },
  },
};

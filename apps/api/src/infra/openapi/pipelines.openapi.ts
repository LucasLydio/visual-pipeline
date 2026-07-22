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

export const pipelinePaths: OpenApiPaths = {
  '/teams/{teamId}/pipeline-templates': {
    get: {
      tags: ['Pipelines'],
      summary: 'List reusable team pipeline templates.',
      operationId: 'listPipelineTemplates',
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: '#/components/parameters/TeamId' },
        {
          name: 'includeInactive',
          in: 'query',
          required: false,
          schema: { type: 'boolean' },
        },
      ],
      responses: {
        '200': response('PipelineTemplateList', 'Templates found.'),
      },
    },
    post: {
      tags: ['Pipelines'],
      summary: 'Create a reusable team pipeline template.',
      operationId: 'createPipelineTemplate',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/TeamId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatePipelineTemplateRequest',
            },
          },
        },
      },
      responses: { '201': response('PipelineTemplate', 'Template created.') },
    },
  },
  '/pipeline-templates/{templateId}': {
    get: {
      tags: ['Pipelines'],
      summary: 'Get a pipeline template.',
      operationId: 'getPipelineTemplate',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineTemplateId' }],
      responses: { '200': response('PipelineTemplate', 'Template found.') },
    },
    patch: {
      tags: ['Pipelines'],
      summary: 'Update a pipeline template.',
      operationId: 'updatePipelineTemplate',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineTemplateId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdatePipelineTemplateRequest',
            },
          },
        },
      },
      responses: { '200': response('PipelineTemplate', 'Template updated.') },
    },
    delete: {
      tags: ['Pipelines'],
      summary: 'Deactivate a pipeline template.',
      operationId: 'archivePipelineTemplate',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineTemplateId' }],
      responses: {
        '200': response('PipelineTemplate', 'Template deactivated.'),
      },
    },
  },
  '/pipeline-templates/{templateId}/steps': {
    post: {
      tags: ['Pipelines'],
      summary: 'Add a step to a pipeline template.',
      operationId: 'createPipelineTemplateStep',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineTemplateId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatePipelineTemplateStepRequest',
            },
          },
        },
      },
      responses: {
        '201': response('PipelineTemplateStep', 'Template step created.'),
      },
    },
  },
  '/pipeline-template-steps/{stepId}': {
    patch: {
      tags: ['Pipelines'],
      summary: 'Update a pipeline template step.',
      operationId: 'updatePipelineTemplateStep',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineStepId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdatePipelineTemplateStepRequest',
            },
          },
        },
      },
      responses: {
        '200': response('PipelineTemplateStep', 'Template step updated.'),
      },
    },
    delete: {
      tags: ['Pipelines'],
      summary: 'Delete a pipeline template step.',
      operationId: 'deletePipelineTemplateStep',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineStepId' }],
      responses: {
        '200': response('MessageResponse', 'Template step deleted.'),
      },
    },
  },
  '/projects/{projectId}/pipelines': {
    get: {
      tags: ['Pipelines'],
      summary: 'List project pipelines.',
      operationId: 'listProjectPipelines',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      responses: { '200': response('PipelineList', 'Pipelines found.') },
    },
    post: {
      tags: ['Pipelines'],
      summary: 'Create a project pipeline, optionally from a template.',
      operationId: 'createProjectPipeline',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePipelineRequest' },
          },
        },
      },
      responses: { '201': response('Pipeline', 'Pipeline created.') },
    },
  },
  '/pipelines/{pipelineId}': {
    get: {
      tags: ['Pipelines'],
      summary: 'Get a project pipeline.',
      operationId: 'getPipeline',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineId' }],
      responses: { '200': response('Pipeline', 'Pipeline found.') },
    },
    patch: {
      tags: ['Pipelines'],
      summary: 'Update a project pipeline.',
      operationId: 'updatePipeline',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdatePipelineRequest' },
          },
        },
      },
      responses: { '200': response('Pipeline', 'Pipeline updated.') },
    },
    delete: {
      tags: ['Pipelines'],
      summary: 'Archive a project pipeline.',
      operationId: 'archivePipeline',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineId' }],
      responses: { '200': response('Pipeline', 'Pipeline archived.') },
    },
  },
  '/pipelines/{pipelineId}/steps': {
    post: {
      tags: ['Pipelines'],
      summary: 'Add a step to a project pipeline.',
      operationId: 'createPipelineStep',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreatePipelineStepRequest' },
          },
        },
      },
      responses: { '201': response('PipelineStep', 'Pipeline step created.') },
    },
  },
  '/pipeline-steps/{stepId}': {
    patch: {
      tags: ['Pipelines'],
      summary: 'Update a project pipeline step.',
      operationId: 'updatePipelineStep',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineStepId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdatePipelineStepRequest' },
          },
        },
      },
      responses: { '200': response('PipelineStep', 'Pipeline step updated.') },
    },
    delete: {
      tags: ['Pipelines'],
      summary: 'Delete a project pipeline step.',
      operationId: 'deletePipelineStep',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/PipelineStepId' }],
      responses: {
        '200': response('MessageResponse', 'Pipeline step deleted.'),
      },
    },
  },
};

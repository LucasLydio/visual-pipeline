import type { OpenApiPaths } from './openapi.types.js';

const projectResponse = (description: string): Record<string, unknown> => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Project' },
    },
  },
});

export const projectPaths: OpenApiPaths = {
  '/teams/{teamId}/projects': {
    get: {
      tags: ['Projects'],
      summary: 'List team projects.',
      operationId: 'listTeamProjects',
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: '#/components/parameters/TeamId' },
        { $ref: '#/components/parameters/Search' },
      ],
      responses: { '200': { description: 'Projects found.' } },
    },
    post: {
      tags: ['Projects'],
      summary: 'Connect a project repository.',
      operationId: 'createProject',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/TeamId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateProjectRequest' },
          },
        },
      },
      responses: { '201': projectResponse('Project created.') },
    },
  },
  '/projects/{projectId}': {
    get: {
      tags: ['Projects'],
      summary: 'Get a project.',
      operationId: 'getProject',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      responses: { '200': projectResponse('Project found.') },
    },
    patch: {
      tags: ['Projects'],
      summary: 'Update a project.',
      operationId: 'updateProject',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateProjectRequest' },
          },
        },
      },
      responses: { '200': projectResponse('Project updated.') },
    },
    delete: {
      tags: ['Projects'],
      summary: 'Unsync a project repository.',
      operationId: 'unsyncProject',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      responses: { '200': projectResponse('Project unsynced.') },
    },
  },
  '/projects/{projectId}/archive': {
    patch: {
      tags: ['Projects'],
      summary: 'Archive a project.',
      operationId: 'archiveProject',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      responses: { '200': projectResponse('Project archived.') },
    },
  },
  '/projects/{projectId}/unarchive': {
    patch: {
      tags: ['Projects'],
      summary: 'Unarchive a project.',
      operationId: 'unarchiveProject',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/ProjectId' }],
      responses: { '200': projectResponse('Project unarchived.') },
    },
  },
};

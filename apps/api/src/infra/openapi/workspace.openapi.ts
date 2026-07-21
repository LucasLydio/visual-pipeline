import type { OpenApiPaths } from './openapi.types.js';

export const workspacePaths: OpenApiPaths = {
  '/workspace/dashboard': {
    get: {
      tags: ['Workspace'],
      summary: 'Load dashboard workspace data.',
      operationId: 'getWorkspaceDashboard',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'teamId',
          in: 'query',
          required: false,
          schema: { type: 'string', format: 'uuid' },
        },
      ],
      responses: {
        '200': {
          description: 'Workspace dashboard loaded.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WorkspaceDashboard' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
};

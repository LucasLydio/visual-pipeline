import type { OpenApiPaths } from './openapi.types.js';

export const healthPaths: OpenApiPaths = {
  '/health/database': {
    get: {
      tags: ['Health'],
      summary: 'Check database connection.',
      operationId: 'getDatabaseHealth',
      responses: {
        '200': {
          description: 'Database connection is healthy.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DatabaseHealthResponse' },
            },
          },
        },
        '503': { $ref: '#/components/responses/ServiceUnavailable' },
      },
    },
  },
};

import type { OpenApiPaths } from './openapi.types.js';

export const appPaths: OpenApiPaths = {
  '/': {
    get: {
      tags: ['App'],
      summary: 'Read application greeting.',
      operationId: 'getAppGreeting',
      responses: {
        '200': {
          description: 'Application greeting.',
          content: {
            'text/plain': {
              schema: { type: 'string', example: 'Hello World!' },
            },
          },
        },
      },
    },
  },
};

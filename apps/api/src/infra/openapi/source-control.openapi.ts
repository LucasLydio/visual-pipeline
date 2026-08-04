import type { OpenApiPaths } from './openapi.types.js';

export const sourceControlPaths: OpenApiPaths = {
  '/source-control/github/repositories': {
    get: {
      tags: ['Source control'],
      summary: 'List repositories visible to the connected GitHub account.',
      operationId: 'listGitHubRepositories',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'GitHub repositories found.',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GitHubRepositoryList' },
            },
          },
        },
      },
    },
  },
};

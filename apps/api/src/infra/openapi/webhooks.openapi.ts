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

export const webhookPaths: OpenApiPaths = {
  '/webhooks/github': {
    post: {
      tags: ['Webhooks'],
      summary: 'Receive and validate GitHub webhook events.',
      operationId: 'receiveGithubWebhook',
      parameters: [
        { $ref: '#/components/parameters/GitHubEvent' },
        { $ref: '#/components/parameters/GitHubDelivery' },
        { $ref: '#/components/parameters/GitHubSignature256' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object' },
          },
        },
      },
      responses: {
        '201': response('WebhookResult', 'Webhook accepted.'),
      },
    },
  },
};

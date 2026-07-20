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

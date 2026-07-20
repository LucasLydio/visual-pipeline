import type { OpenApiPaths } from './openapi.types.js';

const publicUserResponse = (description: string): Record<string, unknown> => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/PublicUser' },
    },
  },
});

export const usersPaths: OpenApiPaths = {
  '/users': {
    post: {
      tags: ['Users'],
      summary: 'Create a user.',
      operationId: 'createUser',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateUserRequest' },
          },
        },
      },
      responses: {
        '201': publicUserResponse('User created.'),
        '400': { $ref: '#/components/responses/BadRequest' },
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    get: {
      tags: ['Users'],
      summary: 'List users.',
      operationId: 'listUsers',
      parameters: [{ $ref: '#/components/parameters/UserSearch' }],
      responses: {
        '200': {
          description: 'Users matching the query.',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/PublicUser' },
              },
            },
          },
        },
      },
    },
  },
  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get a user by id.',
      operationId: 'getUserById',
      parameters: [{ $ref: '#/components/parameters/UserId' }],
      responses: {
        '200': publicUserResponse('User found.'),
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    patch: {
      tags: ['Users'],
      summary: 'Update a user.',
      operationId: 'updateUser',
      parameters: [{ $ref: '#/components/parameters/UserId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateUserRequest' },
          },
        },
      },
      responses: {
        '200': publicUserResponse('User updated.'),
        '400': { $ref: '#/components/responses/BadRequest' },
        '404': { $ref: '#/components/responses/NotFound' },
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
    delete: {
      tags: ['Users'],
      summary: 'Disable a user.',
      operationId: 'disableUser',
      parameters: [{ $ref: '#/components/parameters/UserId' }],
      responses: {
        '200': publicUserResponse('User disabled.'),
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};

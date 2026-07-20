import type { OpenApiPathItem, OpenApiPaths } from './openapi.types.js';

const jsonRequest = (schema: string): Record<string, unknown> => ({
  required: true,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

const jsonResponse = (
  description: string,
  schema: string,
): Record<string, unknown> => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: `#/components/schemas/${schema}` },
    },
  },
});

const authPost = (
  summary: string,
  operationId: string,
  requestSchema: string,
  responseSchema: string,
  errors: Record<string, OpenApiPathItem>,
): OpenApiPathItem => ({
  post: {
    tags: ['Auth'],
    summary,
    operationId,
    requestBody: jsonRequest(requestSchema),
    responses: {
      '201': jsonResponse('Request completed.', responseSchema),
      ...errors,
    },
  },
});

export const authPaths: OpenApiPaths = {
  '/auth/github': {
    get: {
      tags: ['Auth'],
      summary: 'Start GitHub OAuth login.',
      operationId: 'startGithubLogin',
      parameters: [
        {
          name: 'redirectTo',
          in: 'query',
          required: false,
          schema: { type: 'string', example: '/app' },
        },
      ],
      responses: {
        '302': {
          description: 'Redirects to GitHub authorization.',
          headers: {
            Location: {
              schema: { type: 'string', format: 'uri' },
            },
          },
        },
        '503': { $ref: '#/components/responses/ServiceUnavailable' },
      },
    },
  },
  '/auth/github/callback': {
    get: {
      tags: ['Auth'],
      summary: 'Handle GitHub OAuth callback.',
      operationId: 'handleGithubCallback',
      parameters: [
        {
          name: 'code',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'state',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'error',
          in: 'query',
          required: false,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '302': {
          description: 'Redirects to the frontend auth callback.',
          headers: {
            Location: {
              schema: { type: 'string', format: 'uri' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '503': { $ref: '#/components/responses/ServiceUnavailable' },
      },
    },
  },
  '/auth/register': authPost(
    'Register a user and open a session.',
    'registerUser',
    'RegisterRequest',
    'AuthResponse',
    {
      '400': { $ref: '#/components/responses/BadRequest' },
      '409': { $ref: '#/components/responses/Conflict' },
    },
  ),
  '/auth/login': authPost(
    'Login with email and password.',
    'loginUser',
    'LoginRequest',
    'AuthResponse',
    {
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
  ),
  '/auth/refresh': authPost(
    'Rotate a refresh token and issue a new access token.',
    'refreshSession',
    'RefreshSessionRequest',
    'RefreshSessionResponse',
    {
      '400': { $ref: '#/components/responses/BadRequest' },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
  ),
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Revoke the current session.',
      operationId: 'logoutUser',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LogoutRequest' },
          },
        },
      },
      responses: {
        '201': jsonResponse('Session revoked.', 'MessageResponse'),
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: 'Read the authenticated user.',
      operationId: 'getCurrentUser',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': jsonResponse('Authenticated user profile.', 'PublicUser'),
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
  '/auth/password/forgot': authPost(
    'Create a password reset token.',
    'requestPasswordReset',
    'RequestPasswordResetRequest',
    'RequestPasswordResetResponse',
    {
      '400': { $ref: '#/components/responses/BadRequest' },
    },
  ),
  '/auth/password/reset': authPost(
    'Set a new password using a reset token.',
    'resetPassword',
    'ResetPasswordRequest',
    'MessageResponse',
    {
      '400': { $ref: '#/components/responses/BadRequest' },
      '401': { $ref: '#/components/responses/Unauthorized' },
    },
  ),
};

import type { OpenApiSchema } from './openapi.types.js';

export const openApiSchemas: Record<string, OpenApiSchema> = {
  UserStatus: {
    type: 'string',
    enum: ['ACTIVE', 'INVITED', 'DISABLED'],
    example: 'ACTIVE',
  },
  PublicUser: {
    type: 'object',
    required: [
      'id',
      'email',
      'displayName',
      'status',
      'hasPassword',
      'createdAt',
      'updatedAt',
    ],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string', example: 'Dev Team User' },
      emailVerifiedAt: { type: 'string', format: 'date-time', nullable: true },
      status: { $ref: '#/components/schemas/UserStatus' },
      lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
      passwordChangedAt: {
        type: 'string',
        format: 'date-time',
        nullable: true,
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      hasPassword: { type: 'boolean', example: true },
    },
  },
  CreateUserRequest: {
    type: 'object',
    required: ['email', 'displayName'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'dev.team@example.com',
      },
      displayName: { type: 'string', minLength: 2, maxLength: 120 },
      password: { type: 'string', minLength: 8, maxLength: 128 },
      status: { $ref: '#/components/schemas/UserStatus' },
    },
  },
  UpdateUserRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string', minLength: 2, maxLength: 120 },
      password: { type: 'string', minLength: 8, maxLength: 128 },
      status: { $ref: '#/components/schemas/UserStatus' },
    },
  },
  RegisterRequest: {
    type: 'object',
    required: ['email', 'displayName', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'dev.auth@example.com',
      },
      displayName: { type: 'string', minLength: 2, maxLength: 120 },
      password: { type: 'string', minLength: 8, maxLength: 128 },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        example: 'dev.auth@example.com',
      },
      password: { type: 'string', example: 'StrongPass123' },
    },
  },
  AuthResponse: {
    type: 'object',
    required: [
      'user',
      'accessToken',
      'refreshToken',
      'expiresAt',
      'refreshExpiresAt',
    ],
    properties: {
      user: { $ref: '#/components/schemas/PublicUser' },
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      expiresAt: { type: 'string', format: 'date-time' },
      refreshExpiresAt: { type: 'string', format: 'date-time' },
    },
  },
  RefreshSessionRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: { refreshToken: { type: 'string' } },
  },
  RefreshSessionResponse: {
    type: 'object',
    required: ['accessToken', 'refreshToken', 'expiresAt', 'refreshExpiresAt'],
    properties: {
      accessToken: { type: 'string' },
      refreshToken: { type: 'string' },
      expiresAt: { type: 'string', format: 'date-time' },
      refreshExpiresAt: { type: 'string', format: 'date-time' },
    },
  },
  LogoutRequest: {
    type: 'object',
    properties: { refreshToken: { type: 'string' } },
  },
  MessageResponse: {
    type: 'object',
    required: ['message'],
    properties: { message: { type: 'string', example: 'Logged out.' } },
  },
  RequestPasswordResetRequest: {
    type: 'object',
    required: ['email'],
    properties: { email: { type: 'string', format: 'email' } },
  },
  RequestPasswordResetResponse: {
    type: 'object',
    required: ['message'],
    properties: {
      message: {
        type: 'string',
        example: 'If the email exists, a password reset was created.',
      },
      resetToken: { type: 'string' },
    },
  },
  ResetPasswordRequest: {
    type: 'object',
    required: ['token', 'password'],
    properties: {
      token: { type: 'string' },
      password: { type: 'string', minLength: 8, maxLength: 128 },
    },
  },
  DatabaseHealthResponse: {
    type: 'object',
    required: ['status', 'database', 'source'],
    properties: {
      status: { type: 'string', enum: ['ok'] },
      database: { type: 'string', enum: ['postgresql'] },
      source: { type: 'string', example: 'local-postgres' },
    },
  },
  ErrorResponse: {
    type: 'object',
    required: ['message', 'statusCode'],
    properties: {
      message: { type: 'string' },
      error: { type: 'string' },
      statusCode: { type: 'integer' },
    },
  },
};

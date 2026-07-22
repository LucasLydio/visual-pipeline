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
  WorkspaceUser: {
    type: 'object',
    required: ['id', 'email', 'displayName'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      displayName: { type: 'string', example: 'Dev Team User' },
      status: { $ref: '#/components/schemas/UserStatus' },
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
      user: { $ref: '#/components/schemas/WorkspaceUser' },
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
  TeamRole: {
    type: 'string',
    enum: ['OWNER', 'ADMIN', 'MAINTAINER', 'DEVELOPER', 'VIEWER'],
  },
  Team: {
    type: 'object',
    required: ['id', 'name', 'slug', 'createdAt', 'updatedAt'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string', example: 'Platform Team' },
      slug: { type: 'string', example: 'platform-team' },
      description: { type: 'string', nullable: true },
      memberCount: { type: 'integer', example: 4 },
      currentUserRole: { $ref: '#/components/schemas/TeamRole' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  TeamMember: {
    type: 'object',
    required: ['id', 'teamId', 'userId', 'role', 'user'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      teamId: { type: 'string', format: 'uuid' },
      userId: { type: 'string', format: 'uuid' },
      role: { $ref: '#/components/schemas/TeamRole' },
      title: { type: 'string', nullable: true, example: 'Tech lead' },
      user: { $ref: '#/components/schemas/PublicUser' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateTeamRequest: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120 },
      slug: { type: 'string', minLength: 2, maxLength: 80 },
      description: { type: 'string', maxLength: 240 },
    },
  },
  UpdateTeamRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 120 },
      slug: { type: 'string', minLength: 2, maxLength: 80 },
      description: { type: 'string', nullable: true, maxLength: 240 },
    },
  },
  AddTeamMemberRequest: {
    type: 'object',
    properties: {
      userId: { type: 'string', format: 'uuid' },
      email: { type: 'string', format: 'email' },
      role: { $ref: '#/components/schemas/TeamRole' },
      title: { type: 'string', maxLength: 80, example: 'Frontend' },
    },
  },
  UpdateTeamMemberRequest: {
    type: 'object',
    properties: {
      role: { $ref: '#/components/schemas/TeamRole' },
      title: { type: 'string', nullable: true, maxLength: 80 },
    },
  },
  SourceProvider: {
    type: 'string',
    enum: ['GITHUB', 'GITLAB', 'BITBUCKET'],
  },
  ProjectStatus: {
    type: 'string',
    enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'],
  },
  Project: {
    type: 'object',
    required: ['id', 'teamId', 'name', 'slug', 'provider', 'repositoryUrl'],
    properties: {
      id: { type: 'string', format: 'uuid' },
      teamId: { type: 'string', format: 'uuid' },
      ownerId: { type: 'string', format: 'uuid', nullable: true },
      name: { type: 'string', example: 'Deploy Agent' },
      slug: { type: 'string', example: 'deploy-agent' },
      provider: { $ref: '#/components/schemas/SourceProvider' },
      repositoryUrl: {
        type: 'string',
        example: 'https://github.com/acme/deploy-agent',
      },
      repositoryId: { type: 'string', nullable: true },
      defaultBranch: { type: 'string', example: 'main' },
      status: { $ref: '#/components/schemas/ProjectStatus' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  CreateProjectRequest: {
    type: 'object',
    required: ['name', 'provider', 'repositoryUrl'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 140 },
      slug: { type: 'string', minLength: 2, maxLength: 100 },
      provider: { $ref: '#/components/schemas/SourceProvider' },
      repositoryUrl: { type: 'string' },
      repositoryId: { type: 'string' },
      defaultBranch: { type: 'string', example: 'main' },
    },
  },
  UpdateProjectRequest: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 140 },
      slug: { type: 'string', minLength: 2, maxLength: 100 },
      provider: { $ref: '#/components/schemas/SourceProvider' },
      repositoryUrl: { type: 'string' },
      repositoryId: { type: 'string', nullable: true },
      defaultBranch: { type: 'string' },
      status: { $ref: '#/components/schemas/ProjectStatus' },
    },
  },
  WorkspaceDashboard: {
    type: 'object',
    required: ['currentUser', 'teams', 'members', 'projects'],
    properties: {
      currentUser: { $ref: '#/components/schemas/WorkspaceUser' },
      activeTeam: { $ref: '#/components/schemas/Team' },
      teams: {
        type: 'array',
        items: { $ref: '#/components/schemas/Team' },
      },
      members: {
        type: 'array',
        items: { $ref: '#/components/schemas/TeamMember' },
      },
      projects: {
        type: 'array',
        items: { $ref: '#/components/schemas/Project' },
      },
    },
  },
};

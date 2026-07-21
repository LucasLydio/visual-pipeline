import type { OpenApiPaths } from './openapi.types.js';

const teamResponse = (description: string): Record<string, unknown> => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/Team' },
    },
  },
});

const memberResponse = (description: string): Record<string, unknown> => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/TeamMember' },
    },
  },
});

export const teamPaths: OpenApiPaths = {
  '/teams': {
    get: {
      tags: ['Teams'],
      summary: 'List teams for current user.',
      operationId: 'listTeams',
      security: [{ bearerAuth: [] }],
      responses: { '200': { description: 'Teams found.' } },
    },
    post: {
      tags: ['Teams'],
      summary: 'Create a team.',
      operationId: 'createTeam',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/CreateTeamRequest' },
          },
        },
      },
      responses: {
        '201': teamResponse('Team created.'),
        '409': { $ref: '#/components/responses/Conflict' },
      },
    },
  },
  '/teams/{teamId}': {
    get: {
      tags: ['Teams'],
      summary: 'Get a team.',
      operationId: 'getTeam',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/TeamId' }],
      responses: { '200': teamResponse('Team found.') },
    },
    patch: {
      tags: ['Teams'],
      summary: 'Update a team.',
      operationId: 'updateTeam',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/TeamId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateTeamRequest' },
          },
        },
      },
      responses: { '200': teamResponse('Team updated.') },
    },
    delete: {
      tags: ['Teams'],
      summary: 'Delete a team.',
      operationId: 'deleteTeam',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/TeamId' }],
      responses: { '200': { description: 'Team deleted.' } },
    },
  },
  '/teams/{teamId}/members': {
    get: {
      tags: ['Team members'],
      summary: 'List team members.',
      operationId: 'listTeamMembers',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/TeamId' }],
      responses: { '200': { description: 'Team members found.' } },
    },
    post: {
      tags: ['Team members'],
      summary: 'Add a team member.',
      operationId: 'addTeamMember',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/TeamId' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddTeamMemberRequest' },
          },
        },
      },
      responses: { '201': memberResponse('Team member added.') },
    },
  },
  '/teams/{teamId}/members/{memberId}': {
    patch: {
      tags: ['Team members'],
      summary: 'Update a team member role.',
      operationId: 'updateTeamMember',
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: '#/components/parameters/TeamId' },
        { $ref: '#/components/parameters/MemberId' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateTeamMemberRequest' },
          },
        },
      },
      responses: { '200': memberResponse('Team member updated.') },
    },
    delete: {
      tags: ['Team members'],
      summary: 'Remove a team member.',
      operationId: 'removeTeamMember',
      security: [{ bearerAuth: [] }],
      parameters: [
        { $ref: '#/components/parameters/TeamId' },
        { $ref: '#/components/parameters/MemberId' },
      ],
      responses: { '200': { description: 'Team member removed.' } },
    },
  },
};

import { appPaths } from './app.openapi.js';
import { authPaths } from './auth.openapi.js';
import { openApiComponents } from './components.openapi.js';
import { healthPaths } from './health.openapi.js';
import type { OpenApiDocument } from './openapi.types.js';
import { projectPaths } from './projects.openapi.js';
import { openApiSchemas } from './schemas.openapi.js';
import { teamPaths } from './teams.openapi.js';
import { usersPaths } from './users.openapi.js';
import { workspacePaths } from './workspace.openapi.js';

export const openApiDocument: OpenApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Visual Pipeline API',
    version: '0.1.0',
    description: 'API contract for auth, users, and infrastructure health.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Nest API',
    },
  ],
  tags: [
    { name: 'App', description: 'Basic application route.' },
    { name: 'Health', description: 'Infrastructure health routes.' },
    {
      name: 'Auth',
      description: 'Registration, login, sessions, and password recovery.',
    },
    { name: 'Users', description: 'User CRUD and personal data maintenance.' },
    { name: 'Teams', description: 'Team workspace management.' },
    { name: 'Team members', description: 'Team membership and roles.' },
    { name: 'Projects', description: 'Connected source repositories.' },
    { name: 'Workspace', description: 'Frontend-optimized workspace data.' },
  ],
  paths: {
    ...appPaths,
    ...healthPaths,
    ...authPaths,
    ...usersPaths,
    ...teamPaths,
    ...projectPaths,
    ...workspacePaths,
  },
  components: {
    ...openApiComponents,
    schemas: openApiSchemas,
  },
};

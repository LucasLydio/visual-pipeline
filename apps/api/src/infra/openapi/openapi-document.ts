import { appPaths } from './app.openapi.js';
import { authPaths } from './auth.openapi.js';
import { openApiComponents } from './components.openapi.js';
import { healthPaths } from './health.openapi.js';
import type { OpenApiDocument } from './openapi.types.js';
import { openApiSchemas } from './schemas.openapi.js';
import { usersPaths } from './users.openapi.js';

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
  ],
  paths: {
    ...appPaths,
    ...healthPaths,
    ...authPaths,
    ...usersPaths,
  },
  components: {
    ...openApiComponents,
    schemas: openApiSchemas,
  },
};

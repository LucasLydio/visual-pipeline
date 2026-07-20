# Visual Pipeline API OpenAPI

Import `http://localhost:3000/main.json` into Insomnia to get the current API
routes.

## Files

- `README.md`: import guide.
- `../src/infra/openapi/*.openapi.ts`: modular OpenAPI source.
- `../src/infra/openapi/openapi-document.ts`: bundled document served by Nest.

## Import In Insomnia

Use the running API URL:

```text
http://localhost:3000/main.json
```

The response is a single bundled OpenAPI JSON document. It does not depend on
external JSON files, so Insomnia does not need to resolve module references over
HTTP.

If you use the Insomnia CLI:

```bash
inso import spec http://localhost:3000/main.json
```

## GitHub OAuth Local Setup

Create a GitHub OAuth App with:

- Homepage URL: `http://localhost:4200`
- Authorization callback URL: `http://localhost:3000/auth/github/callback`

Then set:

```text
GITHUB_CLIENT_ID=your-client-id
GITHUB_CLIENT_SECRET=your-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
FRONTEND_AUTH_CALLBACK_URL=http://localhost:4200/auth/callback
AUTH_OAUTH_STATE_SECRET=any-long-random-local-secret
```

Start login from:

```text
http://localhost:3000/auth/github?redirectTo=/app
```

GitHub users can hide their public email. The API requests `user:email` and
uses the primary verified email when GitHub returns it. If GitHub does not
return an email, the API creates the user with GitHub's deterministic no-reply
identity email, such as `123456+username@users.noreply.github.com`.

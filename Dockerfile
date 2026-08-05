FROM node:22-alpine AS workspace

WORKDIR /workspace

RUN mkdir -p apps/api apps/deploy-agent apps/web packages/contracts

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/deploy-agent/package.json apps/deploy-agent/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN npm ci

COPY . .

FROM workspace AS api-build
RUN npm --prefix apps/api run build

FROM workspace AS web-build
RUN npm --prefix apps/web run build

FROM workspace AS deploy-agent-build
RUN npm --prefix apps/deploy-agent run build

FROM workspace AS tests
CMD ["npm", "run", "test:container"]

FROM node:22-alpine AS api

WORKDIR /workspace
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=api-build --chown=node:node /workspace /workspace

USER node
EXPOSE 3000
CMD ["sh", "-c", "npm --prefix apps/api run db:migrate:deploy && npm --prefix apps/api run start:prod"]

FROM nginx:1.27-alpine AS web

COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=web-build /workspace/apps/web/dist/web/browser /usr/share/nginx/html

EXPOSE 80

FROM node:22-alpine AS deploy-agent

WORKDIR /workspace
ENV NODE_ENV=production
ENV PORT=3001

RUN apk add --no-cache docker-cli docker-cli-compose

COPY --from=deploy-agent-build --chown=node:node /workspace /workspace

USER node
EXPOSE 3001
CMD ["npm", "--prefix", "apps/deploy-agent", "run", "start:prod"]

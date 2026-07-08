FROM node:22.16-alpine AS base

RUN apk add --no-cache libc6-compat openssl \
	&& corepack enable && corepack prepare pnpm@10.17.1 --activate

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

ENV NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"

ENV OTEL_EXPORTER_OTLP_PROTOCOL="grpc"
ENV OTEL_EXPORTER_OTLP_ENDPOINT="http://otel-collector:4317"

ENV OTEL_EXPORTER_OTLP_LOGS_PROTOCOL="http/protobuf"
ENV OTEL_EXPORTER_OTLP_LOGS_ENDPOINT="http://otel-collector:4318/v1/logs"

ENV OTEL_RESOURCE_ATTRIBUTES="service.name=api-ifsp,deployment.environment=prod"

RUN addgroup --system --gid 1001 nodejs \
	&& adduser --system --uid 1001 fastify --ingroup nodejs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/dist ./dist
COPY --from=builder --chown=fastify:nodejs /app/prisma ./prisma
COPY --from=builder --chown=fastify:nodejs /app/src/shared/constants/prompts ./src/shared/constants/prompts

USER fastify

EXPOSE 8000

CMD ["node", "dist/server.js"]

FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY . /app
WORKDIR /app

ENV HOME="/app"
RUN corepack enable && corepack prepare

RUN pnpm install --frozen-lockfile

CMD [ "pnpm", "run", "start:prod" ]



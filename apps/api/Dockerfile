# API de Copiloto (apps/api) — Express 5 + Prisma, empaquetada con esbuild a
# dist/index.mjs (ver script/build.ts). Los paquetes npm y el cliente Prisma
# generado quedan como externals, así que el runtime necesita node_modules +
# prisma/generated/ presentes — por eso construimos y corremos en la MISMA
# imagen (single-stage), simple y a prueba de symlinks de pnpm.
#
# IMPORTANTE: el contexto de build debe ser la RAÍZ del monorepo (no apps/api),
# porque el bundle inlinea los workspaces @copiloto/* y necesita el lockfile.
#   docker build -f apps/api/Dockerfile -t copiloto-api .
FROM node:22-bookworm-slim

# Prisma (engine) necesita openssl + ca-certificates en Debian slim.
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# pnpm vía corepack, fijado a la versión del repo (packageManager).
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copia el monorepo. El .dockerignore excluye node_modules, dist, .next,
# .git y prisma/generated (se regeneran en el build → engine de Linux).
COPY . .

# Instala dependencias del workspace y construye la API.
# `prisma generate` corre dentro del build → genera el query engine de Linux,
# no el de macOS (clave para que no truene en el contenedor).
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @copiloto/api build

ENV NODE_ENV=production
# Render/Fly inyectan PORT; el server lo lee de process.env.PORT (default 3400).
EXPOSE 3400

WORKDIR /app/apps/api
CMD ["node", "dist/index.mjs"]

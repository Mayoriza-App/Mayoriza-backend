FROM node:24-alpine

WORKDIR /usr/src/app

RUN corepack enable

# Copiamos el .npmrc explícitamente
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml ./

ENV CI=true

# Instalamos sin variables de entorno extra, ya que el .npmrc 
# le dirá a pnpm qué paquetes tienen permiso para ejecutar scripts
RUN pnpm install --frozen-lockfile --unsafe-perm

COPY . .

RUN pnpm prisma generate

EXPOSE 3001

CMD ["pnpm", "run", "start:dev"]
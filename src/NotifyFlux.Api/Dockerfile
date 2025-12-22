FROM node:18-alpine AS base
WORKDIR /app

COPY src/NotifyFlux.Api/package.json src/NotifyFlux.Api/tsconfig.json ./ 
COPY tsconfig.base.json ./tsconfig.base.json
COPY src/NotifyFlux.Api/src ./src

RUN npm install && npm run build && npm prune --omit=dev

FROM node:18-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY src/NotifyFlux.Api/package.json ./package.json
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]

FROM node:18-alpine AS build
WORKDIR /app

COPY src/NotifyFlux.Web/package.json src/NotifyFlux.Web/tsconfig.json src/NotifyFlux.Web/index.html ./ 
COPY tsconfig.base.json /tsconfig.base.json
COPY src/NotifyFlux.Web/vite.config.ts ./vite.config.ts
COPY src/NotifyFlux.Web/src ./src

ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL
ARG VITE_DEFAULT_TENANT_ID
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_DEFAULT_TENANT_ID=$VITE_DEFAULT_TENANT_ID

RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY src/NotifyFlux.Web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

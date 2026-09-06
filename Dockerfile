FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
 
COPY . .
RUN npm run build

FROM nginx:alpine

# curl para healthcheck
RUN apk add --no-cache curl

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/frontend/browser/. /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
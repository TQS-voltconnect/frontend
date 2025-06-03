# Build stage
FROM node:24-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --ignore-scripts

COPY src ./src
COPY public ./public
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY nginx.conf ./
COPY index.html ./
COPY eslint.config.js ./
COPY env_example ./
RUN npm run build

# Serve with Nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar o script entrypoint que vai criar o config.js em runtime
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN mkdir -p /run /var/cache/nginx \
    && chown -R nginx:nginx /run /var/cache/nginx /etc/nginx /usr/share/nginx/html

USER nginx

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
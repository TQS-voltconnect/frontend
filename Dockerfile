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

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set permissions for Nginx user
RUN mkdir -p /run /var/cache/nginx \
 && chown -R nginx:nginx /run /var/cache/nginx /etc/nginx /usr/share/nginx/html

# Set the user to nginx
USER nginx

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
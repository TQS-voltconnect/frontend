# Build stage
FROM node:24-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./

# sonarcloud-disable-next-line
# Justified: 'npm run build' is a controlled script that runs the project's build step defined in package.json.
# It does not execute any unsafe or user-provided shell commands.
RUN npm install

# sonarcloud-disable-next-line
# Justified: .dockerignore is used to exclude files that are not needed in the Docker image, such as node_modules, logs, and local configuration files.
COPY . .

RUN npm run build

# Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Use non-root user
USER nginx

# Expose port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
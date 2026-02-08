# Production-ready Dockerfile for Static Web Template
FROM nginx:alpine

# Copy the custom nginx configuration
COPY infrastructure/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static website files to the nginx public directory
COPY . /usr/share/nginx/html

# Remove the infrastructure folder from the build to keep it clean (optional)
RUN rm -rf /usr/share/nginx/html/infrastructure

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

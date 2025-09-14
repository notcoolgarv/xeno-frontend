FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/app.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri /index.html;
  }
  gzip on;
  gzip_types text/plain text/css application/javascript application/json image/svg+xml;
  add_header Cache-Control "public, max-age=31536000";
  location = /index.html { add_header Cache-Control "no-cache"; }
}
EOF
EXPOSE 80

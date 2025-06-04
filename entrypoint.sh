#!/bin/sh

cat <<EOF > /usr/share/nginx/html/config.js
window.__RUNTIME_CONFIG__ = {
  VITE_API_BASE_URL: "${API_BASE_URL}",
};
EOF

exec nginx -g "daemon off;"
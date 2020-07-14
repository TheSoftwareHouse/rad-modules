#!/usr/bin/env sh
set -e

case "$1" in
  "")
    echo "No command detected. Please run container with command ('api' or 'debug')"
    echo "shutting down..."
    ;;

  "api")
    NODE_ENV=production node /app/build/services/pdf/src/index.js
    ;;

  "debug")
    NODE_ENV=debug node /app/build/services/pdf/src/index.js
    ;;

  *)
    exec "$@"
    ;;
esac
#!/usr/bin/env sh
set -e

case "$1" in
    'api')        
        NODE_ENV=production node /app/build/services/{{serviceName}}/src/index.js
    ;;
    *)
    exec "$@"
esac
exit 0
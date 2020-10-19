---
id: security-getting-started
title: Getting started
---

## Security

To start playing with the security service you need:

1. The internet connection (only to pull docker images from dockerhub)
2. Installed docker and docker-compose (optional but it will save you a lot of time)

After that please follow steps:

1. Create a directory where we will be playing with the security service:

```text
mkdir security-service-playground
```

2. Go to the directory:

```text
cd security-service-playground
```

3. Create docker-compose.yml:

```text
touch docker-compose.yml
```

4. Open docker-compose.yml:

```text
 open -e docker-compose.yml
```

5. Copy and paste the example from **Working example docker-compose.yaml** save the file
6. Run docker-compose:

```text
 docker-compose up
```

Now you can go to http://localhost:50050/api-docs/#/ and play with security.

Most of the endpoints are secured, so you need to provide JWT token. To get JWT token you need to authenticate by using login endpoint. After that insert token to padlock icon (only token without, Bearer part) and click login.

You can also open the admin panel (separate service, check RAD Admin). The panel should be available on http://localhost:9000/. By default you should be able to log in with default credentials: superadmin, superadmin (remember to change this defaults for production environment)

## Working example docker-compose.yaml

```dockerfile
version: "3.7"

services:
  postgres:
    image: postgres:10-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_USERNAME: postgres
      POSTGRES_DB: users
    networks:
      - app

  redis:
    image: redis:4-alpine
    hostname: redis
    networks:
      - app

  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    volumes:
      - ./init-data-volume/:/app/services/security/init-data-volume
    ports:
      - "50050:50050"

    depends_on:
      - postgres
      - redis
    networks:
      - app

  security-panel:
    image: tshio/rad-admin:0.0.12
    environment:
      REACT_APP_SECURITY_API_URL: "http://localhost:50050"
      REACT_APP_MODULES: security
    ports:
      - 9000:80
    networks:
      - app

networks:
  app:

```

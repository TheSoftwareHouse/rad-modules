---
id: security-keycloak-integration
title: Keycloak integration
---

## Keycloak integration

Security service provides easy integration with existing or new one Keycloak server.

## Connecting to the Keycloak server

```
  security:
    image: tshio/security:latest
    command: api
    hostname: security
  environment:
    API_URL: "http://localhost:50050"
    AUTHENTICATION_STRATEGY: keycloak
    KEYCLOAK_URL: "http://localhost:8090"
    KEYCLOAK_REALM_NAME: "rad-security-auth"
    KEYCLOAK_CLIENT_ID: "rad-security"
    KEYCLOAK_SECURITY_CLIENT_ID "6c3465b1-2674-4704-a940-c41194dbd951"
    KEYCLOAK_CLIENT_SECRET: "7680c12c-4430-40e0-8968-b73c99b4dcf0"
    KEYCLOAK_ADMIN_USERNAME: admin
    KEYCLOAK_ADMIN_PASSWORD: password
  depends_on:
    - postgres
    - redis
    - keycloak
  ports:
    - 50050:50050
  networks:
    - app

  postgres:
    image: postgres:12-alpine
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_USERNAME: postgres
      POSTGRES_DB: users
    networks:
      - app

  keycloak:
    image: jboss/keycloak
    command: ["-Djboss.socket.binding.port-offset=10","-Dkeycloak.import=/security-realm.json","-Dkeycloak.profile.feature.upload_scripts=enabled"]
    environment:
      DB_VENDOR: POSTGRES
      DB_ADDR: keycloak-postgres
      DB_DATABASE: keycloak
      DB_USER: keycloak
      DB_SCHEMA: public
      DB_PASSWORD: password
      KEYCLOAK_USER: "admin"
      KEYCLOAK_PASSWORD: "admin"
    ports:
      - 8090:8090
    networks:
      - app
    depends_on:
      - keycloak-postgres
    volumes:
      - ./keycloak/config/security-realm.json:/security-realm.json
  
  keycloak-postgres:
    image: postgres:12-alpine
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: password
    networks:
      - app
    restart: always
```
The above configuration creates a new Keycloak REALM fully configured to work with the rad-security service that
contains the initial OpenID client configuration with the "superadmin" user, and the attribute and policy configuration (ABAC).

To create a new configuration in an existing Keycloak system, follow these steps:

## Login to Keycloak
![keycloak-main-page](assets/security/keycloak/3.png)

## Create new ClientID endpoint
- Set the `Client ID` and `Name`
- Set the `Access Type` to `Confidential`
- Enable `Direct Access Grants Enable`, `Service Account Enabled` and `Authorization Enabled`
- Set the `Valid Redirect URIs`
- Save configuration

![keycloak-clientid](assets/security/keycloak/5.png)

Got to `Authorization` -> `Resources` and click `Create`

This is an ABAC configuration. For example, we would like to create a new resource called `api/users` with the `ADMIN_PANEL` attribute

![keycloak-new-resource](assets/security/keycloak/7.png)

We need have to create an ABAC policy. Go to `Authorization` -> `Policies` and click `Create js policy`

![keycloak-new-resource](assets/security/keycloak/9.png)

Now we have a simple configured Keycloak client for rad-security.

## Add the superadmin user

![keycloak-new-resource](assets/security/keycloak/13.png)

## Add attribute for the superadmin user

![keycloak-new-resource](assets/security/keycloak/14.png)

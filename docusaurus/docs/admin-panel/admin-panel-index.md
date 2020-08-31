---
id: admin-panel-index
title: Introduction
---

## Description:

Each of the services provides a REST API to manage resources. But if you would like you can run the rad admin panel with GUI. In the rad admin panel, you will be able to manage e.g. users and policies. Below you can check how simple it is to connect the panel.

If you didn't change default credential for admin user you can log in into the panel by using login: "superadmin", password: "superadmin"

>Note: If you will use the security module in production remember to change default credentials.

You can find RAD admin panel image here: [dockerhub](https://hub.docker.com/r/tshio/rad-admin)

## Working example docker-compose.yaml

```
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

  rad-admin-panel:
    image: tshio/rad-admin:latest
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

`REACT_APP_MODULES` variable defines which services will be enabled to manage with the admin panel. If you want to add multiple services, separate them with commas:
`REACT_APP_MODULES: security,scheduler`
List of supported modules:
- security
- scheduler

When you run command `docker-compose up` you can open the rad admin panel in your browser: http://localhost:9000

## How to login into rad admin panel?

Open your browser and go to http://localhost:9000 and login with your credentials. (If you haven't changed default credentials jet you can use login: `superadmin`, password: `superadmin`)

>Note: If you will use the security module in production remember to change default credentials.

![login-view](assets/admin-panel/login-view.png)

## How to add user?
![add-user-view](assets/admin-panel/add-user-view.png)

## How to edit user?
![edit-user-view-1](assets/admin-panel/edit-user-view-1.png)
![edit-user-view-2](assets/admin-panel/edit-user-view-2.png)

## Where can I find all policies?
![all-policies-view](assets/admin-panel/all-policies-view.png)

## How can I find all users with the policy?
![users-with-policy-1](assets/admin-panel/users-with-policy-1.png)
![users-with-policy-2](assets/admin-panel/users-with-policy-2.png)

## How can I find all attributes?
![all-attributes-view](assets/admin-panel/all-attributes-view.png)

## How can I add new api key?
![add-access-key-view](assets/admin-panel/add-access-key-view.png)
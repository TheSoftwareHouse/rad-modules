<p align="center">
 <img src="data/logo.svg" alt="" />
</p>

<p align="center">
   Current travis build:
  <a href="https://travis-ci.com/TheSoftwareHouse/rad-modules"><img src="https://travis-ci.com/TheSoftwareHouse/rad-modules.svg?branch=master" alt="build status" height="18"></a>
  &emsp;
</p>

##

### Rapid-application development modules

There are many digital systems worldwide. Each system was developed to solve some business requirements, despite each system is different they all have common (modules) to achieve their requirements e.g

- **Security** module to handle users and users policy,
- **Mailer** module for sending emails,
- **Scheduler** module for running scheduled jobs,
- **Notifications** module for pushing notifications,
- **PDF** module for converting HTML to PDF,
- **Admin** module with GUI admin panel to manage other modules (optional),

RAD modules were developed to simplify the development process so developers can focus only on business requirements.

For example, your app needs to send an email after some operation but you don't have implemented the mailing module jet. No worries you can pull our service and use it in your app. Things you need to do are only a few steps:

- Pull our docker image of mailing service
- Add service to yours docker-compose file
- Set necessary env variables
- Call methods from your app to new mailing service via HTTP methods

Our modules are fully configurable so you can change things you want or things you don't need.

If you want to read more about our RAD modules please check the description of each module.

In case of issues feel free to add a new issue on our github.

---

### What’s under the hood?

RAD Modules framework is written in TypeScript, based on Express and Awilix (DI container) development model.

RAD Modules provide many features. The list includes (but not limited to):

- Quick scaffolding
  
  Create actions, routes, and models - right from the CLI using Plop micro-generator framework.
- Dependency injection
- Static code analysis
- User management and administration tools
- Generic Filter — a component which allows users to create their own search conditions
- Generic REST API
- Keycloak/OpenID Integration

---

### Configuration

After checkout of a repository, please perform the following steps in exact sequence:

1. Copy docker-compose.override
    ```
    $ cp docker-compose.override.yml.dist docker-compose.override.yml
    ```
2. Run `make all`

3. Run watch - `npm run watch`

Alternatively you can do it manually:

1. Copy docker-compose.override
    ```
    $ cp docker-compose.override.yml.dist docker-compose.override.yml
    ```
2. Run `npm i`

3. Run `cd ./services/security && npm i`

4. Run `cd ./services/scheduler && npm i`

5. Run `cd ./services/gateway && npm i`

6. Run `cd ./services/mailer && npm i`

7. Run `cd ./services/notifications && npm i`

8. Run `cd ./services/pdf && npm i`

9. Run `npm run docker-build-watcher`

10. Run `npm run docker-build-scheduler`

11. Run `npm run docker-build-security`

12. Run `npm run docker-build-mailer`

13. Run `npm run docker-build-notifications`

14. Run `npm run docker-build-gateway`

15. Run `npm run docker-build-pdf`

16. Run watch - `npm run watch`

---

### How to check if everything works?

1. If you forgot to run builder run `npm run watch`

2. Run `docker-compose up security` (or you can up another service with you want to work)

3. Open your browser and go to: [http://localhost:50050/api-docs/#/](http://localhost:50050/api-docs/#/)

You should see the swagger panel and request in terminal

---

### Dev setup

This app is fully dockerized, so in order to use it you have to have docker and docker-compose installed. What's more you need to have npm in order to run npm scripts.

1. In order to run specific container run:

    ```
    docker-compose up <container-name>
    ```

2. In order to watch files for dev purpose type:

    ```
    npm run watch
    ```

3. If you need to close all containers run:

    ```
    npm run down
    ```
---

### Code generation

We're using Plop for routes, models, actions, commands and handlers generation.

```
npm run plop
```

---

### Code style

We're using Prettier and ESLint to keep code clean. In order to reformat/check code run:

```
npm run lint
npm run format
```

---

### Migrations

Migrations should be stored inside migrations directory of specific service.

Easiest way to create a migration is to generate it from entity/ies. Run inside specific service directory:

```
npm run generate-migration -- <migration-name>
```

This should generate a migration for all connected entities.

---

### Documentation

If you want to read more about RAD modules or check examples of how to set it up, please read the [documentation](https://thesoftwarehouse.github.io/rad-modules-docs/docs/index.html)

---

### ReDoc

If you want to check all endpoint definitions of each service, please check RAD modules [Redoc](https://thesoftwarehouse.github.io/rad-modules-api-docs/)

---

### **Issues:**

If you notice any issues while using, let as know on **[github](https://github.com/TheSoftwareHouse/rad-modules/issues)**.
Security issues, please sent on <a href="mailto:security.opensource@tsh.io"><b>email</b></a>

---

### **You may also like our other projects:**

- **[RAD Modules Tools](https://github.com/TheSoftwareHouse/rad-modules-tools)**
- **[Babelsheet-js](https://github.com/TheSoftwareHouse/babelsheet-js)**
- **[Fogger](https://github.com/TheSoftwareHouse/fogger)**

---

### **About us:**

<p align="center">
  <a href="https://tsh.io/pl"><b>The Software House</b></a>
  &emsp;
  <img src="data/tsh.png" alt="tsh.png" width="50" />
</p>

---

### License

[![license](https://img.shields.io/badge/license-MIT-4dc71f.svg)](https://raw.githubusercontent.com/TheSoftwareHouse/rad-modules/main/LICENSE)

This project is licensed under the terms of the [MIT license](/LICENSE).

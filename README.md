<p align="center">
 <img src="data/logo.svg" alt="" />
</p>

<p align="center">
   Current travis build:
  <a href="https://travis-ci.com/TheSoftwareHouse/rad-modules"><img src="https://travis-ci.com/TheSoftwareHouse/rad-modules.svg?branch=master" alt="build status" height="18"></a>
  &emsp;
</p>

##

### **Security** module to handle users and users policy,



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
2. Run watch `npm start`

3. Run security service `npm run security`

4. Run production integration tests `npm run security-integration`

---

### How to check if everything works?

1. If you forgot to run builder run `npm run watch`

2. Run `docker-compose up security`

3. Open your browser and go to: [http://localhost:50050/api-docs/#/](http://localhost:50050/api-docs/#/)

You should see the swagger panel and request in terminal

---

### Dev setup

This app is fully dockerized, so in order to use it you have to have docker and docker-compose installed. What's more you need to have npm in order to run npm scripts.

1. In order to run specific container run:

    ```
    docker-compose up security
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
- **[Boilerplate API](https://github.com/TheSoftwareHouse/express-boilerplate)**
- **[Serverless Boilerplate](https://github.com/TheSoftwareHouse/serverless-boilerplate)**
- **[Kakunin](https://github.com/TheSoftwareHouse/Kakunin)**
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


[![Build Status](https://travis-ci.com/TheSoftwareHouse/rad-modules.svg?branch=master)](https://travis-ci.com/TheSoftwareHouse/rad-modules)

# rad-modules

## Configuration

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

## How to check if everything works?

1. If you forgot to run builder run `npm run watch`

2. Run `docker-compose up security` (or you can up another service with you want to work)

3. Open your browser and go to: [http://localhost:50050/api-docs/#/](http://localhost:50050/api-docs/#/)

You should see the swagger panel and request in terminal

## Dev setup

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

## Code generation

We're using Plop for routes, models, actions, commands and handlers generation.

```
npm run plop
```

## Code style

We're using Prettier and ESLint to keep code clean. In order to reformat/check code run:

```
npm run lint
npm run format
```

## Migrations

Migrations should be stored inside migrations directory of specific service.

Easiest way to create a migration is to generate it from entity/ies. Run inside specific service directory:

```
npm run generate-migration -- <migration-name>
```

This should generate a migration for all connected entities.

## Documentation

If you want to read more about RAD modules or check examples of how to set it up, please read the [documentation](https://thesoftwarehouse.github.io/rad-modules-docs/docs/index.html)

## ReDoc

If you want to check all endpoint definitions of each service, please check RAD modules [Redoc](https://thesoftwarehouse.github.io/rad-modules-api-docs/)
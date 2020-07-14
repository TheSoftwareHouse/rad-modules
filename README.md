# rad-modules

## Configuration

After checkout of a repository, please perform the following steps in exact sequence:

1. Copy docker-compose.override
    ```
    $ cp docker-compose.override.yml.dist docker-compose.override.yml
    ```
2. Run `npm i`

3. Run `cd ./services/security && npm i`

4. Run `cd ./services/scheduler && npm i`

5. Run `cd ./services/gateway && npm i`

6. Run `cd ./services/mailer && npm i`

7. Run `npm run docker-build-watcher`

8. Run `npm run docker-build-scheduler`

9. Run `npm run docker-build-security`

10. Run `npm run docker-build-mailer`

11. Run watch - `npm run watch`

Alternatively you can use Make:

1. Run `make install`

2. Run `make docker-build`

## Dev setup

This app is fully dockerized, so in order to use it you have to have docker and docker-compose installed. What's more you need to have npm in order to run npm scripts.

1. In order to run specifc container run:

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

## Services configuration details
## 1. Security service:

PASSWORD_REGEX:

- **_Description_**: Regexp that shows how the password suppose to look like
- **_Default_**: `".{8,}"`

PASSWORD_RANDOM:

- **_Description_**: The variable specifies if the user should provide a new password in reset password flow, or the password will be generated randomly by the system. With default configuration user should send username for whom password will be reset and new password e.g. `{ username: "Username", password: "NewPassword" }`. If the value will be set to `true` then the password will be generated randomly and the user will receive it in response.
- **_Default_**: `false`

PASSWORD_RANDOM_MAX_LENGTH:

- **_Description_**: The variable specifies the length of the randomly generated password.
- **_Default_**: `8`

API_KEY_REGEX:

- **_Description_**: Regexp that shows how the api-key suppose to look like
- **_Default_**: `".{8,}"`

REDIS_URL:

- **_Description_**: The variable specifies URL to Redis.
- **_Default_**: `"redis://redis:6379"`

REDIS_PREFIX:

- **_Description_**: The variable specifies Redis prefix with allows check with data belong to security service.
- **_Default_**: `"rad-modules:security:"`

ACCESS_TOKEN_EXPIRATION:

- **_Description_**: The variable specifies how long the access token will be available in seconds
- **_Default_**: `600`

ACCESS_TOKEN_SECRET:

- **_Description_**: The variable specifies secret that will be used for generating the access token
- **_Default_**: `"secret1"`

REFRESH_TOKEN_EXPIRATION:

- **_Description_**: The variable specifies how long the refresh token will be available in seconds **IMPORTANT!:** `REFRESH_TOKEN_EXPIRATION` should be greater than `ACCESS_TOKEN_EXPIRATION`
- **_Default_**: `1200`

REFRESH_TOKEN_SECRET:

- **_Description_**: The variable specifies secret that will be used for generating the refresh token
- **_Default_**: `"secret2"`

CONNECTION_STRING:

- **_Description_**: The variable specifies the database connection string
- **_Default_**: `"postgres://postgres:password@postgres:5432/users"`

DB_LOGGING:

- **_Description_**: The variable specifies if the logging in the database should be turned on
- **_Default_**: `true`

AUTHENTICATION_STRATEGY:

- **_Description_**: The variable specifies which authentication strategy will be enabled.
    - Accepted values: `custom`, `proxy`, `keycloak`
- **_Default_**: `custom`

KEYCLOAK_CLIENT_CONFIG_JSON_PATH:

- **_Description_**: The variable specifies the path to file with realm configuration
- **_Default_**: "/app/services/security/init-data-volume/keycloak.json`

KEYCLOAK_CLIENT_TOKEN_URL:

- **_Description_**: The variable specifies URL to keycloak token endpoint.
- **_Default_**: `http://keycloak:8090/auth/realms/rad-security-auth/protocol/openid-connect/token`

KEYCLOAK_CLIENT_TYPE:

- **_Description_**: The variable specifies keycloak client type.
- **_Default_**: `rad-security`

KEYCLOAK_CLIENT_SECRET:

- **_Description_**: The variable specifies keycloak client secret string.
- **_Default_**: `5aced109-cebb-49c5-8d8e-93582c6ff898`

KEYCLOAK_CLIENT_SCOPE:

- **_Description_**: The variable specifies keycloak client scope.
- **_Default_**: `openid`

KEYCLOAK_CLIENT_GRANT_TYPE:

- **_Description_**: The variable specifies keycloak client grant type.
- **_Default_**: `password`

***_OAuth Login Configuration_***

OAUTH_ENABLED_PROVIDERS:

- **_Description_**: The variable specifies which OAuth providers will be enabled.
    - Accepted values: `"facebook"`, `"google"`, `"microsoft"`
        - `"facebook"` means: "Facebook login api, 
        - `"google"` - "Google login api"
        - `"microsoft"` - "Microsoft login api"

- **_Default_**: `"google"`

OAUTH_CREATE_USER_ACCOUNT:

- **_Description_**: The variable specifies if a user witch is login via OAuth provider should have created an account in the DB after the login flow
- **_Default_**: `false`

OAUTH_DEFAULT_ATTRIBUTES:

- **_Description_**: A comma-separated list of default attributes assigned to a new oauth user
- **_Default_**: `["OAUTH_USER"]`

***_Google Login Configuration_***

OAUTH_GOOGLE_CLIENT_ID:

- **_Description_**: The variable specifies the id of external Google OAuth provider
- **_Default_**: `""`

OAUTH_GOOGLE_CLIENT_SECRET:

- **_Description_**: The variable specifies the secret for external Google OAuth provider
- **_Default_**: `""`

OAUTH_GOOGLE_CLIENT_ALLOWED_DOMAINS:

- **_Description_**: A comma separated list of domains that are allowed to login using Google OAuth
- **_Default_**: `[]`

***_Facebook Login Configuration_***

OAUTH_FACEBOOK_CLIENT_ID:

- **_Description_**: The variable specifies the id of external Facebook OAuth provider
- **_Default_**: `""`

OAUTH_FACEBOOK_CLIENT_SECRET:

- **_Description_**: The variable specifies the secret for external Facebook OAuth provider
- **_Default_**: `""`

***_Microsoft Login Configuration_***

OAUTH_MICROSOFT_CLIENT_ID:

- **_Description_**: The variable specifies the id of external Microsoft OAuth provider
- **_Default_**: `""`

OAUTH_MICROSOFT_CLIENT_SECRET:

- **_Description_**: The variable specifies the secret for external Microsoft OAuth provider
- **_Default_**: `""`

OAUTH_MICROSOFT_CLIENT_ALLOWED_DOMAINS:

- **_Description_**: A comma separated list of domains that are allowed to login using Microsoft OAuth
- **_Default_**: `[]`

***_Deprecated, Old OAuth Login Configuration_***

OAUTH_CLIENT_ID: **_DEPRECATED, USE OAUTH_GOOGLE_CLIENT_ID instead! For backward compatibility only!_**

- **_Description_**: The variable specifies the id of external Google OAuth provider
- **_Default_**: `""`

OAUTH_SECRET: **_DEPRECATED, USE OAUTH_GOOGLE_CLIENT_SECRET instead! For backward compatibility only!_**

- **_Description_**: The variable specifies the secret for external Google OAuth provider
- **_Default_**: `""`

OAUTH_ALLOWED_DOMAINS: **_DEPRECATED, USE OAUTH_GOOGLE_CLIENT_ALLOWED_DOMAINS instead! For backward compatibility only!_**

- **_Description_**: A comma separated list of domains that are allowed to login using Google OAuth
- **_Default_**: `[]`

CREATE_USER_ACCOUNT_ON_OAUTH: **_DEPRECATED, USE OAUTH_CREATE_USER_ACCOUNT instead! For backward compatibility only!_**

- **_Description_**: The variable specifies if a user witch is login via OAuth provider should have created an account in the DB after the login flow
- **_Default_**: `false`

INITIAL_API_KEYS:

- **_Description_**: The variable specifies initial api keys. Each api key needs to be a valid uuid4.
- **_Default_**: `[]`

INITIAL_USERS_DATA_JSON_PATH:

- **_Description_**: The variable specifies the path to file with initial data for the "User" table
- **_Default_**: `"/app/services/security/init-data-volume/users.json"`

INITIAL_POLICIES_DATA_JSON_PATH:

- **_Description_**: The variable specifies the path to file with initial data for the "Policies" table
- **_Default_**: `"/app/services/security/init-data-volume/policy.json"`

LOG_LEVEL:

- **_Description_**: The variable specifies the level of logging logs by the logger available options: `"error"`, `"warn"`, `"help"`, `"info"`, `"debug"`, `"verbose"`, `"silly"`
- **_Default_**: `"debug"`

REQUEST_LOGGER_FORMAT:

- **_Description_**: All requests are logged so the DevOps can check if the request comes from a user or other service (we use morgan library to log information). We created our format to display information but fill free to use one of build-in morgan library available options: `"combined"`, `"common"`, `"dev"`, `"short"`, `"tiny"`
- **_Default_**: `":remote-addr :method :url :status :response-time ms - req-body :body - api-key :apiKey - authorization :authorization"`

REQUEST_BODY_KEYS_TO_HIDE:

- **_Description_**: We don't want to look at our users' private data so by default we hide some common properties. If you want to cheng that please provide your string with words you want to hide separated witch coma `,`
- **_Default_**: `"password,token,accessToken,accessKey,authorization"`

IS_USER_ACTIVATION_NEEDED:

- **_Description_**: The variable specifies if user after register needs to activate the account with an activation link
- **_Default_**: `false`

TIME_TO_ACTIVE_ACCOUNT_IN_DAYS:

- **_Description_**: The variable specifies how long can activate the registered account (in days)
- **_Default_**: `3`

SUPER_ADMIN_USERNAME:

- **_Description_**: The variable specifies super admin login (the user with has all rights)
- **_Default_**:`"superadmin"`

SUPER_ADMIN_PASSWORD:

- **_Description_**: The variable specifies super admin password
- **_Default_**:`"superadmin"`

MAILER_TYPE:

- **_Description_**: The variable specifies mailer configuration (available options: `disabled`, `standalone`, `external`)
- **_Default_**: `disabled`

MAILER_URL:

- **_Description_**: The variable specifies mailer service URL
- **_Default_**: `http://localhost/`

MAILER_NEW_PASSWORD_SPA_URL:

- **_Description_**: The variable specifies spa service URL based on which all email urls should be build on
- **_Default_**: `http://localhost:3000/new-password`

MAILER_SMTP_POOL:

- **_Description_**: The variable specifies standalone mailer pool option. Set to true to use pooled connections instead of creating a new connection for every email
- **_Default_**: `true`

MAILER_SMTP_HOST:

- **_Description_**: The variable specifies the hostname or IP address to connect to
- **_Default_**: `localhost`

MAILER_SMTP_PORT:

- **_Description_**: The variable specifies the port to connect to (defaults to 587 if is secure is false or 465 if true)
- **_Default_**: `465`

MAILER_SMTP_SECURE:

- **_Description_**: If true the connection will use TLS when connecting to server. If false then TLS is used if server supports the STARTTLS extension. In most cases set this value to true if you are connecting to port 465. For port 587 or 25 keep it false
- **_Default_**: `true`

MAILER_SMTP_USER:

- **_Description_**: The variable specifies the SMTP username
- **_Default_**: `""`

MAILER_SMTP_PASS:

- **_Description_**: The variable specifies the SMTP password
- **_Default_**: `""`

MAILER_TEMPLATE_CREATE_USER:

- **_Description_**: Path to email template for create new user confirmation
- **_Default_**: `"/app/services/security/src/utils/mailer/templates/create-user/default/"`

MAILER_TEMPLATE_RESET_PASSWORD:

- **_Description_**: Path to email template for reset password confirmation
- **_Default_**: `"/app/services/security/src/utils/mailer/templates/reset-password/default/"`

MAILER_TEMPLATE_RESET_PASSWORD_TOKEN:

- **_Description_**: Path to email template for reset password token
- **_Default_**: `"/app/services/security/src/utils/mailer/templates/reset-password-token/default/"`

MAILER_SENDER_NAME:

- **_Description_**: Sender name
- **_Default_**: `"Joe Doe"`

MAILER_SENDER_EMAIL:

- **_Description_**: Sender name
- **_Default_**: `"joe.doe@example.com"`

SUPER_ADMIN_ROLE:

- **_Description_**: The variable specifies super admin role
- **_Default_**: `"ROLE_SUPERADMIN"`

SUPER_ADMIN_ATTRIBUTES:

- **_Description_**: The variable specifies an array of super admin attributes the admin has access every vere, but on the other hand, perhaps you would like to add some custom attributes for the super admin so here is the place
- **_Default_**:`["ROLE_SUPERADMIN"]`

ADMIN_PANEL_ADD_USER:

- **_Description_**: The variable specifies with police have access to add a new users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_EDIT_USER:

- **_Description_**: The variable specifies with police have access to edit a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_DEACTIVATE_USER:

- **_Description_**: The variable specifies with police have access to deactivate a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_DELETE_USER:

- **_Description_**: The variable specifies with police have access to delete a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_RESET_PASSWORD:

- **_Description_**: The variable specifies with police have access to reset the password for a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_ADD_POLICIES:

- **_Description_**: The variable specifies with police have access to add new policies
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_POLICIES:

- **_Description_**: The variable specifies with police have access to read policies
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_REMOVE_POLICIES:

- **_Description_**: The variable specifies with police have access to remove policies
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_ADD_ATTRIBUTE_TO_USER:

- **_Description_**: The variable specifies with police have access to add police attributes for a user
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_REMOVE_ATTRIBUTE_TO_USER:

- **_Description_**: The variable specifies with police have access to remove police attributes from a user
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USER_ID:

- **_Description_**: The variable specifies with police have access to an endpoint with allow to get user's id by username
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_CREATE_ACCESS_KEY:

- **_Description_**: The variable specifies with police have access to create api key
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_REMOVE_ACCESS_KEY:

- **_Description_**: The variable specifies with police have access to remove api key
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_ACCESS_KEY:

- **_Description_**: The variable specifies with police have access to read api keys
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USER:

- **_Description_**: The variable specifies with police have access to get user by user id
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USERS:

- **_Description_**: The variable specifies with police have access to read users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USERS_BY_RESOURCE_NAME:

- **_Description_**: The variable specifies with police have access to read users by resource name
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_ATTRIBUTES:

- **_Description_**: The variable specifies with police have access to read attributes
- **_Default_**: `"ADMIN_PANEL"`

## 2. Mailer service:

PROTOCOL_PROTOCOL:
* ***Description***: The variable specifies the protocol that will be used to create the service instance
* ***Default***: `"http"`

TRANSPORT_TYPE:
* ***Description***: The variable specifies the transport type for mail sending service
* ***Default***: `"smtp"`

TRANSPORT_SMTP_POOL:
* ***Description***: The boolean variable specifies if the pooling will be turned on
* ***Default***: `true`

TRANSPORT_SMTP_HOST:
* ***Description***: The variable specifies the host name for mail sending service
* ***Default***: ` `

TRANSPORT_SMTP_PORT:
* ***Description***: The variable specifies the port for mail sending service
* ***Default***: `465`

TRANSPORT_SMTP_SECURE:
* ***Description***: The boolean variable specifies if the mailing service connection should be secure
* ***Default***: `true`

TRANSPORT_SMTP_AUTH_USER:
* ***Description***: The variable specifies a username that will be used to login into SMTP service
* ***Default***: ` `

TRANSPORT_SMTP_AUTH_PASSWORD:
* ***Description***: The variable specifies a password that will be used to login into SMTP service
* ***Default***: ` `

TRANSPORT_SMTP_DEBUG:
* ***Description***: The boolean variable specifies if the debugging should be allowed in mailing service
* ***Default***: `false`

TRANSPORT_SMTP_TEMPLATES_ROOT:
* ***Description***: The variable specifies the path to file with mail templates
* ***Default***: `"/app/services/mailer/mail-templates/"`

TRANSPORT_SENDGRID_AUTH_KEY:
* ***Description***: The variable specifies the auth key for SendGrid service if the users will choose that system to send emails
* ***Default***: ` `

LOG_LEVEL
* ***Description***: The variable specifies the level of logging logs by the logger
* ***Default***: `"debug"`

## 3. Notifications service:

ACCESS_TOKEN_EXPIRATION
* ***Description***: The variable specifies how long the access token will be available in seconds
* ***Default***: `600`

ACCESS_TOKEN_SECRET
* ***Description***: The variable specifies secret that will be used for generating the access token
* ***Default***: `"secret1"`

LOG_LEVEL
* ***Description***: The variable specifies the level of logging logs by the logger
* ***Default***: `"debug"`

## 4. Scheduler service:

LOG_LEVEL
* ***Description***: The variable specifies the level of logging logs by the logger
* ***Default***: `"debug"`
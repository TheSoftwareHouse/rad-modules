---
id: security-advanced-configuration
title: Advanced configuration
---

## How to download Security service:

You can download the Security service image by using docker command:

```
docker pull tshio/security
```

We keep the image on our public [DockerHub](https://hub.docker.com/r/tshio/security).

## How to set up Security service in your docker-compose file:

```
  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    environment:
      ACCESS_TOKEN_SECRET: secret1234
      ACCESS_TOKEN_EXPIRATION: 1000
    ports:
      - "50050:50050"
    depends_on:
      - postgres
      - redis
```

As you can see, I added some environment variables to the docker-compose file. The variables allow you to overwrite the default setting of the Security service. I just overwrite three of them but you can overwrite all of them (if you need to) a full list of available configuration is bellow.

Security service depends on two other containers to work correctly: DB (Postgres in this situation) and cache (Redis). Therefore we need to use depends_on property.

If you would like to initialize the database with users and policy that you already have you can do it by creating a new catalog e.g. init-data-volume with two files in it: `users.json` and `policy.json` after that you need to add volumes to security container in yours docker-compose (I created the catalog on the same level where the docker-compose file is)

```
    volumes:
      - ./init-data-volume/:/app/services/security/init-data-volume
```

users.json schema:

```
[
    {
      "username": "user1",
      "password": "passw0rd",
      "attributes": ["attr1", "attr2"]
    },
    {
      "username": "user2",
      "password": "passw0rd",
      "attributes": ["attr1", "attr2"]
    }
]
```

policy.json schema:

```
[
    {
      "resource": "res1",
      "attribute": "attr1"
    },
    {
      "resource": "res1",
      "attribute": "attr2"
    },
    {
      "resource": "res2",
      "attribute": "attr1"
    },
    {
      "resource": "res2",
      "attribute": "attr1"
    },
    {
      "resource": "res1",
      "attribute": "attr1"
    },
    {
      "resource": "res1",
      "attribute": "attr1"
    }
]
```

## Social login

Security allows to login using Facebook / Google / Microsoft Azure. In order to use those, configure environment variables. It is possible to have multiple social login options active at the same time.

### Google Auth

```
  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    environment:
      ACCESS_TOKEN_SECRET: secret1234
      ACCESS_TOKEN_EXPIRATION: 1000
      OAUTH_ENABLED_PROVIDERS: "google"
      OAUTH_GOOGLE_CLIENT_ID: 1024671591387-1h85kq8p747478ouqinaq5tm5953u17.apps.googleusercontent.com
      OAUTH_GOOGLE_CLIENT_SECRET: GMHPdnTRGLmelReTFHxNBfU
    ports:
      - "50050:50050"
    depends_on:
      - postgres
      - redis
```

### Facebook Auth

```
  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    environment:
      ACCESS_TOKEN_SECRET: secret1234
      ACCESS_TOKEN_EXPIRATION: 1000
      OAUTH_ENABLED_PROVIDERS: "facebook"
      OAUTH_FACEBOOK_CLIENT_ID: 95901699118315
      OAUTH_FACEBOOK_CLIENT_SECRET: b184620eea19a283573c38b614e9dc5
    ports:
      - "50050:50050"
    depends_on:
      - postgres
      - redis
```

### Microsoft Azure Auth

```
  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    environment:
      ACCESS_TOKEN_SECRET: secret1234
      ACCESS_TOKEN_EXPIRATION: 1000
      OAUTH_ENABLED_PROVIDERS: "microsoft"
      OAUTH_MICROSOFT_CLIENT_ID: 95901699118315
      OAUTH_MICROSOFT_CLIENT_SECRET: b184620eea19a283573c38b614e9dc5
    ports:
      - "50050:50050"
    depends_on:
      - postgres
      - redis
```

## Multiple providers

```
  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    environment:
      ACCESS_TOKEN_SECRET: secret1234
      ACCESS_TOKEN_EXPIRATION: 1000
      OAUTH_ENABLED_PROVIDERS: "microsoft,google,facebook"
      OAUTH_MICROSOFT_CLIENT_ID: 95901699118315
      OAUTH_MICROSOFT_CLIENT_SECRET: b184620eea19a283573c38b614e9dc5
      OAUTH_FACEBOOK_CLIENT_ID: 95901699118315
      OAUTH_FACEBOOK_CLIENT_SECRET: b184620eea19a283573c38b614e9dc5
      OAUTH_GOOGLE_CLIENT_ID: 1024671591387-1h85kq8p747478ouqinaq5tm5953u17.apps.googleusercontent.com
      OAUTH_GOOGLE_CLIENT_SECRET: GMHPdnTRGLmelReTFHxNBfU
    ports:
      - "50050:50050"
    depends_on:
      - postgres
      - redis
```

## Mailer configuration

Security comes with built-in mailer. This allows you to send reset password / user creation emails directrly from it. Of course you can change templates if required. By default mailer is turned off. Use environment variables to turn it on:

```
  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    environment:
      ACCESS_TOKEN_SECRET: secret1234
      ACCESS_TOKEN_EXPIRATION: 1000
      MAILER_TYPE: standalone
      MAILER_SMTP_HOST: "mailhog"
      MAILER_SMTP_PORT: 1025
      MAILER_SMTP_SECURE: "false"
      MAILER_NEW_PASSWORD_SPA_URL: "http://localhost:3000/auth/reset-password"
    ports:
      - "50050:50050"
    depends_on:
      - postgres
      - redis
```

By default it will built in templates. If you want to use a custom ones then remember to mount them to a specific volume:

```
  security:
    image: tshio/security:latest
    working_dir: /app/build/services/security
    command: api
    hostname: security
    environment:
      ACCESS_TOKEN_SECRET: secret1234
      ACCESS_TOKEN_EXPIRATION: 1000
      MAILER_TYPE: standalone
      MAILER_SMTP_HOST: "mailhog"
      MAILER_SMTP_PORT: 1025
      MAILER_SMTP_SECURE: "false"
      MAILER_NEW_PASSWORD_SPA_URL: "http://localhost:3000/auth/reset-password"
    ports:
      - "50050:50050"
    volumes:
      - ./templates:/app/services/security/src/utils/mailer/templates  
    depends_on:
      - postgres
      - redis
```

Currently we support 3 templates:
- create-user - used for new users
- reset-password - used to get new password
- reset-password-token - used to get link to website where you can set a new password

The structure of templates directory need to match:
```
templates:
  create-user:
    default:
      subject.pug - template for subject
      content.pug - template for content
  reset-password:
    default:
      subject.pug - template for subject
      content.pug - template for content    
  reset-password-token:
    default:
      subject.pug - template for subject
      content.pug - template for content   
```

## Default templates

### Create user

#### Subject 
```
= `Welcome ${name}`
```

#### Content 
```
h1 Thank you for creating an account
p Hi #{name}
p Your login: #{user}
```

### Reset password

#### Subject 
```
= "Reset password"
```

#### Content 
```
h1 Your password has been changed successfully!
p Hi #{name}, your new password is: #{password}
```

### Reset password token

#### Subject 
```
= "Reset password initialized"
```

#### Content 
```
h1 Reset password initialized!
p Hi #{name}, go to <a href="#{spaUrl}?token=#{token}">reset password page</a>
```

## Production usage

It is recommended to create a project specific image of security that will ba based on `tshio/secuirty` and contain premade policies, users and email templates (if using standalone version). The easiest way to do so is to create your own `Dockerfile`:

```
FROM tshio/security:latest as security

COPY templates /app/services/security/src/utils/mailer/templates
COPY init-data-volume /app/services/security/init-data-volume
```

## Notification about changes in policies and users

Each time the policy is added or removed you can be informed about it. Also changes in users (adding/removing attributes, adding/removing users, changing activation state of the user) triggers notification.
The payload of notification is object of type:

```
{
  event: string;
  payload: {}
}
```
`event` is event name. The `payload` depends on event type and can be one of:
- policy event payload:
```
{
  policyId: string;
  attributeName: string;
  resourceName: string;
}
```
- user event payload:
```
{
  userId: string;
  attributes: [
    {
      attributeId: string;
      attributeName: string;
    }
];
}
```
You can configure callback URLs of the notification by setting environment variable `EVENT_DISPATCHER_CALLBACK_URLS`. By default this variable is empty so no notifications are sent.

## Configuration setting that you can overwrite via environment variables

API_URL:

- **_Description_**: The URL where the application is available outside
- **_Default_**: `""`

PASSWORD_REGEX:

- **_Description_**: Regexp that shows rules how the password suppose to look like
- **_Default_**: `".{8,}"`

PASSWORD_VALIDATION_ERROR

- **_Description_**: Error message if the password doesn't match regexp
- **_Default_**: `"password must be at least 8 characters"`

PASSWORD_RANDOM:

- **_Description_**: The variable specifies if users that will be inited from the file should have a password generated randomly or a password should be provided in the user's file.
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

- **_Description_**: The variable specifies Redis prefix which allows check which data belong to security service.
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

OAUTH_ENABLED_PROVIDERS"

- **_Description_**: The variable specifies which OAuth provider are enabled. It doesn't mean that you are forced to
- **_Default_**: `""`
- **_Available_**: `"google, facebook, microsoft, other"`

OAUTH_CLIENT_ID:

- **_Description_**: The variable specifies the id of external OAuth provider
- **_Default_**: `""`

OAUTH_SECRET:

- **_Description_**: The variable specifies the secret for external OAuth provider
- **_Default_**: `""`

OAUTH_DEFAULT_ATTRIBUTES:

- **_Description_**: A comma-separated list of default attributes assigned to a new oauth user
- **_Default_**: `[]`

OAUTH_ALLOWED_DOMAINS:

- **_Description_**: A comma separated list of domains that are allowed to login using oauth
- **_Default_**: `[]`

OAUTH_GOOGLE_CLIENT_ID:

- **_Description_**: The variable specifies the id of external Google OAuth provider
- **_Default_**: `""`

OAUTH_GOOGLE_CLIENT_SECRET:

- **_Description_**: The variable specifies the secret for external Google OAuth provider
- **_Default_**: `""`

OAUTH_GOOGLE_CLIENT_ALLOWED_DOMAINS:

- **_Description_**: A comma separated list of domains that are allowed to login using Google OAuth
- **_Default_**: `[]`

OAUTH_MICROSOFT_CLIENT_ID:

- **_Description_**: The variable specifies the id of external Microsoft OAuth provider
- **_Default_**: `""`

OAUTH_MICROSOFT_CLIENT_SECRET:

- **_Description_**: The variable specifies the secret for external Microsoft OAuth provider
- **_Default_**: `""`

OAUTH_MICROSOFT_CLIENT_ALLOWED_DOMAINS:

- **_Description_**: A comma separated list of domains that are allowed to login using Microsoft OAuth
- **_Default_**: `[]`

OAUTH_FACEBOOK_CLIENT_ID:

- **_Description_**: The variable specifies the id of external Facebook OAuth provider
- **_Default_**: `""`

OAUTH_FACEBOOK_CLIENT_SECRET:

- **_Description_**: The variable specifies the secret for external Facebook OAuth provider
- **_Default_**: `""`

OAUTH_CREATE_USER_ACCOUNT

- **_Description_**: The variable specifies if a user which is login via OAuth provider should have created an account in the DB after the login flow
- **_Default_**: `false`

CREATE_USER_ACCOUNT_ON_OAUTH

- **_Description_**: The variable specifies if a user which is login via OAuth provider should have created an account in the DB after the login flow
- **_Default_**: `false`

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

- **_Description_**: We don't want to look at our users' private data so by default we hide some common properties. If you want to cheng that please provide your string with words you want to hide separated with coma `,`
- **_Default_**: `"password,token,accessToken,accessKey,authorization"`

IS_USER_ACTIVATION_NEEDED:

- **_Description_**: The variable specifies if user after register needs to activate the account with an activation link
- **_Default_**: `false`

TIME_TO_ACTIVE_ACCOUNT_IN_DAYS:

- **_Description_**: The variable specifies how long can activate the registered account (in days)
- **_Default_**: `3`

SUPER_ADMIN_USERNAME:

- **_Description_**: The variable specifies super admin login (the user which has all rights)
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

MAILER_NEW_PASSWORD_SPA_URL

- **_Description_**: The variable specifies client app URL which will be send in reset password email
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

- **_Description_**: Path to email template for reset password token confirmation
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

- **_Description_**: The variable specifies which police have access to add a new users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_EDIT_USER:

- **_Description_**: The variable specifies which police have access to edit a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_DEACTIVATE_USER:

- **_Description_**: The variable specifies which police have access to deactivate a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_DELETE_USER:

- **_Description_**: The variable specifies which police have access to delete a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_RESET_PASSWORD:

- **_Description_**: The variable specifies which police have access to reset the password for a users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_ADD_POLICIES:

- **_Description_**: The variable specifies which police have access to add new policies
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_POLICIES:

- **_Description_**: The variable specifies which police have access to read policies
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_REMOVE_POLICIES:

- **_Description_**: The variable specifies which police have access to remove policies
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_ADD_ATTRIBUTE_TO_USER:

- **_Description_**: The variable specifies which police have access to add police attributes for a user
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_REMOVE_ATTRIBUTE_TO_USER:

- **_Description_**: The variable specifies which police have access to remove police attributes from a user
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USER_ID:

- **_Description_**: The variable specifies which police have access to an endpoint which allow to get user's id by username
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USER

- **_Description_**: The variable specifies which police have access to an endpoint which allow to get user
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USERS

- **_Description_**: The variable specifies which police have access to an endpoint which allow to get all users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USERS_BY_RESOURCE_NAME

- **_Description_**: The variable specifies which police have access to an endpoint which allow to get all users by policy resource
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_ATTRIBUTES

- **_Description_**: The variable specifies which police have access to an endpoint which allow to get policy attributes
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_CREATE_ACCESS_KEY:

- **_Description_**: The variable specifies which police have access to create api key
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_REMOVE_ACCESS_KEY:

- **_Description_**: The variable specifies which police have access to remove api key
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_ACCESS_KEYS:

- **_Description_**: The variable specifies which police have access to read api keys
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USER:

- **_Description_**: The variable specifies which police have access to get user by user id
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USERS:

- **_Description_**: The variable specifies which police have access to read users
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_USERS_BY_RESOURCE_NAME:

- **_Description_**: The variable specifies which police have access to read users by resource name
- **_Default_**: `"ADMIN_PANEL"`

ADMIN_PANEL_GET_ATTRIBUTES:

- **_Description_**: The variable specifies which police have access to read attributes
- **_Default_**: `"ADMIN_PANEL"`

INITIAL_API_KEYS

- **_Description_**: If you need API keys to communicate with the security service on the module start you need to provide these keys in string separated by a comma "," e.g. "3add29a2-f629-c17a-0464-fb4415b24e13,875c2b9d-0cb5-5d98-39d3-bb2cc3dc0ca8"
- **_Default_**: `[]`

AUTHENTICATION_STRATEGY:

- **_Description_**: The variable specifies which authentication strategy will be enabled.
    - Accepted values: `custom`, `keycloak`
- **_Default_**: `custom`

KEYCLOAK_CLIENT_CONFIG_JSON_PATH:

- **_Description_**: The variable specifies the path to keycloak realm import file.
- **_Default_**: `"/app/services/security/init-data-volume/keycloak.json"`

KEYCLOAK_REALM_NAME

- **_Description_**: Realm name. A realm manages a set of users, credentials, roles, and groups. A user belongs to and logs into a realm. Realms are isolated from one another and can only manage and authenticate the users that they control.
- **_Default_**: `"rad-security-auth"`

KEYCLOAK_ADMIN_USERNAME

- **_Description_**: Keycloak user name with `admin` roles
- **_Default_**: `"admin"`

KEYCLOAK_ADMIN_PASSWORD

- **_Description_**: Password for the `KEYCLOAK_ADMIN_USERNAME`
- **_Default_**: `"password"`

KEYCLOAK_CLIENT_SECRET

- **_Description_**: For confidential clients, a client secret
- **_Default_**: `"7680c12c-4430-40e0-8968-b73c99b4dcf0"`

KEYCLOAK_CLIENT_ID

- **_Description_**: Keycloak OpenID client name
- **_Default_**: `"rad-security"`

KEYCLOAK_SECURITY_CLIENT_ID

- **_Description_**: Keycloak OpenID client ID
- **_Default_**: `"6c3465b1-2674-4704-a940-c41194dbd95"`

EVENT_DISPATCHER_CALLBACK_URLS

- **_Description_**: Callback URLs of notifications that are sent after changes in policies and users, comma separated.
- **_Default_**: `""`
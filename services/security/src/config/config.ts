import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { getMailerConfig, MailerConfig } from "./mailer.config";
import { DbConfig, DbConfigSchema, getDbConfig } from "./db.config";
import { AuthenticationStrategy, getOauthConfig, OauthConfig, oauthSchema } from "./oauth.config";
import { getKeycloakClientConfig, KeycloakClientConfig, KeycloakClientConfigSchema } from "./keycloak.config";
import {
  getRequestLoggerConfig,
  LoggerConfig,
  LoggerSchema,
  RequestLoggerConfig,
  RequestLoggerSchema,
} from "./logger.config";
import { Joi } from "celebrate";
import { MailerSchema } from "./mailer.config";
import {
  AdminPanelPoliciesSchema,
  AdminPanelPoliciesConfig,
  getAdminPanelPoliciesConfig,
  SUPER_ADMIN_ROLE_NAME,
} from "./admin-panel-policies.config";

export const apiKeyRegex = new RegExp(
  process.env.API_KEY_REGEX || "[0-9a-f]{8}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{4}\\-[0-9a-f]{12}",
);

export const passwordRegex = new RegExp(
  process.env.API_KEY_REGEX || ".{8,}", // by default minimum 8 any chars
);

const passwordSchema = Joi.object({
  randomMaxLength: Joi.number().min(4).required(),
});

const randomPasswordSchema = Joi.object({
  isRandom: Joi.boolean().required(),
  randomMaxLength: Joi.number().min(4).required(),
});

const tokenConfigSchema = Joi.object({
  expirationInSeconds: Joi.number().positive().required(),
  secret: Joi.string().required(),
});

export const usersDataSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string(),
  attributes: Joi.array().items(Joi.string()).unique().required(),
  isActive: Joi.boolean(),
});

export const appConfigSchema = Joi.object({
  port: Joi.number().port().required(),
  apiUrl: Joi.string().allow("").required(),
  applicationType: Joi.string().valid("http").required(),
  authenticationStrategy: Joi.string()
    .valid(...Object.values(AuthenticationStrategy))
    .required(),
  apiKeyHeaderName: Joi.string().required(),
  apiKeyRegex: Joi.object().pattern(apiKeyRegex, Object).required(),
  passwordRegex: Joi.object().pattern(apiKeyRegex, Object).required(),
  passwordValidationError: Joi.string().required(),
  resetPassword: passwordSchema.required(),
  userPassword: randomPasswordSchema.required(),
  adapterPath: Joi.string(),
  dbConfig: DbConfigSchema.required(),
  redisUrl: Joi.string().uri().required(),
  redisPrefix: Joi.string().required(),
  accessTokenConfig: tokenConfigSchema.required(),
  refreshTokenConfig: tokenConfigSchema.required(),
  tokenPayloadConfig: Joi.object({
    disableAttributes: Joi.boolean().required(),
    disablePolicy: Joi.boolean().required(),
  }).required(),
  oauth: oauthSchema.required(),
  keycloakClientConfig: KeycloakClientConfigSchema.required(),
  initialUsersDataJsonPath: Joi.string().required(),
  initialPoliciesDataJsonPath: Joi.string().required(),
  initialApiKeys: Joi.array().items(Joi.string().regex(apiKeyRegex)).required(),
  logger: LoggerSchema.required(),
  userActivationConfig: Joi.object({
    isUserActivationNeeded: Joi.boolean().required(),
    timeToActiveAccountInDays: Joi.number().required(),
  }).required(),
  superAdminRoleName: Joi.string().required(),
  superAdminUser: usersDataSchema,
  adminPanelPolicies: AdminPanelPoliciesSchema,
  mailer: MailerSchema.required(),
  requestLogger: RequestLoggerSchema.required(),
  eventDispatcherCallbackUrls: Joi.array().items(Joi.string().allow("").required()).required(),
}).required();

export const initialUsersDataSchema = Joi.array().items(usersDataSchema).required();

export const initialPoliciesDataSchema = Joi.array()
  .items(
    Joi.object({
      resource: Joi.string().required(),
      attribute: Joi.string().required(),
    }),
  )
  .required();

export type TokenConfig = {
  expirationInSeconds: number;
  secret: string;
};

export type UserActivationConfig = {
  isUserActivationNeeded: boolean;
  timeToActiveAccountInDays: number;
};

export type SuperAdminConfig = {
  username: string;
  password: string;
  attributes: string[];
};

type PasswordConfig = {
  randomMaxLength: number;
};

type RandomPasswordConfig = {
  isRandom: boolean;
  randomMaxLength: number;
};

export type TokenPayloadConfig = {
  disableAttributes: boolean;
  disablePolicy: boolean;
};

export type AppConfig = {
  authenticationStrategy: AuthenticationStrategy;
  adapterPath?: string;
  port: number;
  apiUrl: string;
  applicationType: TransportProtocol.HTTP;
  apiKeyHeaderName: string;
  apiKeyRegex: RegExp;
  passwordRegex: RegExp;
  passwordValidationError: string;
  resetPassword: PasswordConfig;
  userPassword: RandomPasswordConfig;
  dbConfig: DbConfig;
  redisUrl: string;
  redisPrefix: string;
  accessTokenConfig: TokenConfig;
  refreshTokenConfig: TokenConfig;
  tokenPayloadConfig: TokenPayloadConfig;
  oauth: OauthConfig;
  keycloakClientConfig: KeycloakClientConfig;
  initialApiKeys: string[];
  initialUsersDataJsonPath: string;
  initialPoliciesDataJsonPath: string;
  userActivationConfig: UserActivationConfig;
  logger: LoggerConfig;
  superAdminRoleName: string;
  superAdminUser: SuperAdminConfig;
  adminPanelPolicies: AdminPanelPoliciesConfig;
  mailer: MailerConfig;
  requestLogger: RequestLoggerConfig;
  eventDispatcherCallbackUrls: string[];
};

export const appConfig: AppConfig = {
  port: 50050,
  apiUrl: process.env.API_URL || "",
  applicationType: TransportProtocol.HTTP,
  authenticationStrategy: (process.env.AUTHENTICATION_STRATEGY ||
    AuthenticationStrategy.Builtin) as AuthenticationStrategy,
  passwordRegex,
  passwordValidationError: process.env.PASSWORD_VALIDATION_ERROR || "password must be at least 8 characters",
  apiKeyHeaderName: "x-api-key",
  apiKeyRegex, // by default uuid v4 format
  resetPassword: {
    randomMaxLength: +(process.env.PASSWORD_RANDOM_MAX_LENGTH || 8),
  },
  userPassword: {
    isRandom: (process.env.PASSWORD_RANDOM || "false") === "true",
    randomMaxLength: +(process.env.PASSWORD_RANDOM_MAX_LENGTH || 8),
  },
  adapterPath: "/app/build/services/security/src/adapters/custom-adapter",
  redisUrl: process.env.REDIS_URL || "redis://redis:6379",
  redisPrefix: process.env.REDIS_PREFIX || "rad-modules:security:",
  accessTokenConfig: {
    expirationInSeconds: +(process.env.ACCESS_TOKEN_EXPIRATION || 600),
    secret: process.env.ACCESS_TOKEN_SECRET || "secret1",
  },
  refreshTokenConfig: {
    expirationInSeconds: +(process.env.REFRESH_TOKEN_EXPIRATION || 900),
    secret: process.env.REFRESH_TOKEN_SECRET || "secret2",
  },
  tokenPayloadConfig: {
    disableAttributes: (process.env.TOKEN_PAYLOAD_DISABLE_ATTRIBUTES || "false") === "true",
    disablePolicy: (process.env.TOKEN_PAYLOAD_DISABLE_RESOURCES || "false") === "true",
  },
  dbConfig: getDbConfig(),
  oauth: getOauthConfig(),
  keycloakClientConfig: getKeycloakClientConfig(),
  initialApiKeys: process.env.INITIAL_API_KEYS ? process.env.INITIAL_API_KEYS.split(",") : [],
  initialUsersDataJsonPath:
    process.env.INITIAL_USERS_DATA_JSON_PATH || "/app/services/security/init-data-volume/users.json",
  initialPoliciesDataJsonPath:
    process.env.INITIAL_POLICIES_DATA_JSON_PATH || "/app/services/security/init-data-volume/policy.json",
  logger: {
    logLevel: process.env.LOG_LEVEL || "debug",
  },
  userActivationConfig: {
    isUserActivationNeeded: (process.env.IS_USER_ACTIVATION_NEEDED || "false") === "true",
    timeToActiveAccountInDays: +(process.env.TIME_TO_ACTIVE_ACCOUNT_IN_DAYS || 3),
  },
  superAdminRoleName: process.env.SUPER_ADMIN_ROLE || SUPER_ADMIN_ROLE_NAME,
  superAdminUser: {
    username: process.env.SUPER_ADMIN_USERNAME || "superadmin",
    password: process.env.SUPER_ADMIN_PASSWORD || "superadmin",
    attributes: process.env.SUPER_ADMIN_ATTRIBUTES
      ? [...process.env.SUPER_ADMIN_ATTRIBUTES.split(","), `${process.env.SUPER_ADMIN_ROLE || SUPER_ADMIN_ROLE_NAME}`]
      : [`${process.env.SUPER_ADMIN_ROLE || SUPER_ADMIN_ROLE_NAME}`],
  },
  adminPanelPolicies: getAdminPanelPoliciesConfig(),
  mailer: getMailerConfig(),
  requestLogger: getRequestLoggerConfig(),
  eventDispatcherCallbackUrls: (process.env.EVENT_DISPATCHER_CALLBACK_URLS || "").split(","),
};

export { MailerConfig, MailerType } from "./mailer.config";
export { DbConfig } from "./db.config";
export {
  AuthenticationStrategy,
  OauthConfig,
  OauthProvider,
  oauthSchema,
  FacebookClientConfig,
  GoogleClientConfig,
  OauthFirstLogin,
  MicrosoftClientConfig,
} from "./oauth.config";
export { KeycloakClientConfig, KeycloakClientConfigSchema } from "./keycloak.config";
export { LoggerConfig, LoggerSchema, MorganFormatTypes, RequestLoggerConfig } from "./logger.config";
export { MailerSchema, SmtpConfiguration } from "./mailer.config";
export { AdminPanelPoliciesConfig } from "./admin-panel-policies.config";

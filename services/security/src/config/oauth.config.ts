import { Joi } from "celebrate";

export enum OauthProvider {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  MICROSOFT = "microsoft",
  KEYCLOAK = "keycloak",
}

export enum AuthenticationStrategy {
  Builtin = "custom",
  Keycloak = "keycloak",
  Proxy = "proxy",
}

export type GoogleClientConfig = {
  clientId: string;
  secret: string;
  allowedDomains: string[];
  getUserInfoUrl: string;
  getTokenInfoUrl: string;
};

export type FacebookClientConfig = {
  clientId: string;
  secret: string;
};

export type MicrosoftClientConfig = {
  clientId: string;
  secret: string;
  allowedDomains: string[];
};

export type OauthFirstLogin = {
  createUserAccount: boolean;
  defaultAttributes: string[];
};

export type OauthConfig = {
  enabled: OauthProvider[];
  googleClientConfig: GoogleClientConfig;
  facebookClientConfig: FacebookClientConfig;
  microsoftClientConfig: MicrosoftClientConfig;
  oauthFirstLogin: OauthFirstLogin;
};

export const oauthSchema = Joi.object({
  enabled: Joi.array()
    .items(Joi.string().valid(...Object.values(OauthProvider)))
    .required(),
  googleClientConfig: Joi.object({
    clientId: Joi.string().allow("").required(),
    secret: Joi.string().allow("").required(),
    allowedDomains: Joi.array().items(Joi.string()).required(),
    getUserInfoUrl: Joi.string().required(),
    getTokenInfoUrl: Joi.string().required(),
  }).required(),
  facebookClientConfig: Joi.object({
    clientId: Joi.string().allow("").required(),
    secret: Joi.string().allow("").required(),
  }).required(),
  microsoftClientConfig: Joi.object({
    clientId: Joi.string().allow("").required(),
    secret: Joi.string().allow("").required(),
    allowedDomains: Joi.array().items(Joi.string()).required(),
  }).required(),
  oauthFirstLogin: Joi.object({
    createUserAccount: Joi.boolean().required(),
    defaultAttributes: Joi.array(),
  }).required(),
});

export const getOauthConfig = (): OauthConfig => ({
  enabled: process.env.OAUTH_ENABLED_PROVIDERS
    ? (process.env.OAUTH_ENABLED_PROVIDERS.split(",") as OauthProvider[])
    : [OauthProvider.GOOGLE],
  googleClientConfig: {
    clientId: process.env.OAUTH_GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "",
    secret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || process.env.OAUTH_SECRET || "",
    allowedDomains:
      process.env.OAUTH_GOOGLE_CLIENT_ALLOWED_DOMAINS || process.env.OAUTH_ALLOWED_DOMAINS
        ? (process.env.OAUTH_GOOGLE_CLIENT_ALLOWED_DOMAINS || process.env.OAUTH_ALLOWED_DOMAINS || "").split(",")
        : [],
    getUserInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
    getTokenInfoUrl: "https://oauth2.googleapis.com/tokeninfo",
  },
  facebookClientConfig: {
    clientId: process.env.OAUTH_FACEBOOK_CLIENT_ID || "",
    secret: process.env.OAUTH_FACEBOOK_CLIENT_SECRET || "",
  },
  microsoftClientConfig: {
    clientId: process.env.OAUTH_MICROSOFT_CLIENT_ID || "",
    secret: process.env.OAUTH_MICROSOFT_CLIENT_SECRET || "",
    allowedDomains:
      process.env.OAUTH_MICROSOFT_CLIENT_ALLOWED_DOMAINS || process.env.OAUTH_ALLOWED_DOMAINS
        ? (process.env.OAUTH_MICROSOFT_CLIENT_ALLOWED_DOMAINS || process.env.OAUTH_ALLOWED_DOMAINS || "").split(",")
        : [],
  },
  oauthFirstLogin: {
    createUserAccount:
      (process.env.OAUTH_CREATE_USER_ACCOUNT || process.env.CREATE_USER_ACCOUNT_ON_OAUTH || "false") === "true",
    defaultAttributes: process.env.OAUTH_DEFAULT_ATTRIBUTES
      ? process.env.OAUTH_DEFAULT_ATTRIBUTES.split(",")
      : ["OAUTH_USER"],
  },
});

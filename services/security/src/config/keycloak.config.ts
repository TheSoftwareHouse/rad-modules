import { Joi } from "celebrate";

export const KeycloakClientConfigSchema = Joi.object({
  keycloakUrl: Joi.string().uri().required(),
  realmName: Joi.string().required(),
  clientUsername: Joi.string().required(),
  clientPassword: Joi.string().required(),
  clientSecret: Joi.string().required(),
  grantType: Joi.string().required(),
  clientId: Joi.string().required(),
  radSecurityClientId: Joi.string().required(),
});

export type KeycloakClientConfig = {
  keycloakUrl: string;
  realmName: string;
  clientUsername: string;
  clientPassword: string;
  clientSecret: string;
  grantType: string;
  clientId: string;
  radSecurityClientId: string;
};

export const getKeycloakClientConfig = (): KeycloakClientConfig => ({
  keycloakUrl: process.env.KEYCLOAK_URL || "http://keycloak:8090",
  realmName: process.env.KEYCLOAK_REALM_NAME || "rad-security-auth",
  clientUsername: process.env.KEYCLOAK_ADMIN_USERNAME || "admin",
  clientPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || "password",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "7680c12c-4430-40e0-8968-b73c99b4dcf0",
  grantType: "password",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "rad-security",
  radSecurityClientId: process.env.KEYCLOAK_SECURITY_CLIENT_ID || "ffcd5059-eb96-459a-bafa-e79186d58748",
});

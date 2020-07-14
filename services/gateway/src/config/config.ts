import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { Joi } from "celebrate";

export const appConfigSchema = Joi.object({
  port: Joi.number().port().required(),
  applicationType: Joi.string().valid("http").required(),
  apiKeyHeaderName: Joi.string().required(),
  logger: Joi.object({
    logLevel: Joi.string().valid("error", "warn", "help", "info", "debug", "verbose", "silly").required(),
  }).required(),
  requestLogger: Joi.object({
    requestLoggerFormat: Joi.string().required(),
    keysToHide: Joi.array().items(Joi.string()).required(),
  }).required(),
  proxyConfigPath: Joi.string().required(),
  hasAccessEndpointUrl: Joi.string().required(),
});

export enum MorganFormatTypes {
  Combined = "combined",
  Common = "common",
  Dev = "dev",
  Short = "short",
  Tiny = "tiny",
  Default = ":remote-addr :method :url :status :response-time ms - req-body :body - api-key :apiKey - authorization :authorization",
}

export type AppConfig = {
  port: number;
  applicationType: TransportProtocol;
  apiKeyHeaderName: string;
  logger: {
    logLevel: string;
  };
  requestLogger: {
    requestLoggerFormat: MorganFormatTypes | string;
    keysToHide: string[];
  };
  proxyConfigPath: string;
  hasAccessEndpointUrl: string;
};

export const appConfig: AppConfig = {
  port: 50050,
  applicationType: TransportProtocol.HTTP,
  apiKeyHeaderName: "x-api-key",
  logger: {
    logLevel: process.env.LOG_LEVEL || "debug",
  },
  requestLogger: {
    requestLoggerFormat: process.env.REQUEST_LOGGER_FORMAT || MorganFormatTypes.Default,
    keysToHide: process.env.REQUEST_BODY_KEYS_TO_HIDE
      ? (process.env.REQUEST_BODY_KEYS_TO_HIDE || "").split(",")
      : ["password", "token", "accessToken", "accessKey", "authorization"],
  },
  proxyConfigPath: process.env.PROXY_CONFIG_PATH || "/app/build/services/gateway/src/config/proxy.json",
  hasAccessEndpointUrl: process.env.PROXY_HASS_ACCESS_ENDPOINT_URL || "http://security:50050/api/users/has-access",
};

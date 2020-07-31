import { Joi } from "celebrate";
import { DbConfigSchema, DbConfig, getDbConfig } from "./db.config";
import { TransportProtocol } from "../../../../shared/enums/transport-protocol";

const tokenConfigSchema = Joi.object({
  expirationInSeconds: Joi.number().positive().required(),
  secret: Joi.string().required(),
});

export const appConfigSchema = Joi.object({
  port: Joi.number().port().required(),
  applicationType: Joi.string().valid("http").required(),
  apiKeyHeaderName: Joi.string().required(),
  transportType: Joi.string().valid("websocket").required(),
  transportConfig: Joi.object(),
  allowAnonymous: Joi.boolean().required(),
  accessTokenConfig: tokenConfigSchema.required(),
  logger: Joi.object({
    logLevel: Joi.string().valid("error", "warn", "help", "info", "debug", "verbose", "silly").required(),
  }).required(),
  requestLogger: Joi.object({
    requestLoggerFormat: Joi.string().required(),
    keysToHide: Joi.array().items(Joi.string()).required(),
  }).required(),
  dbConfig: DbConfigSchema.required(),
});

export enum MorganFormatTypes {
  Combined = "combined",
  Common = "common",
  Dev = "dev",
  Short = "short",
  Tiny = "tiny",
  Default = ":remote-addr :method :url :status :response-time ms - req-body :body - api-key :apiKey - authorization :authorization",
}

export type TokenConfig = {
  expirationInSeconds: number;
  secret: string;
};

export enum TransportType {
  WebSocket = "websocket",
}

export type AppConfig = {
  port: number;
  transportType: TransportType;
  transportConfig: {
    websocketPort: number;
  };
  allowAnonymous: boolean;
  applicationType: TransportProtocol;
  apiKeyHeaderName: string;
  accessTokenConfig: TokenConfig;
  logger: {
    logLevel: string;
  };
  requestLogger: {
    requestLoggerFormat: MorganFormatTypes | string;
    keysToHide: string[];
  };
  dbConfig: DbConfig;
};

export const appConfig: AppConfig = {
  port: 50050,
  transportType: "websocket" as TransportType,
  transportConfig: {
    websocketPort: 30050,
  },
  allowAnonymous: (process.env.ALLOW_ANONYMOUS || "true") === "true",
  applicationType: TransportProtocol.HTTP,
  apiKeyHeaderName: "x-api-key",
  accessTokenConfig: {
    expirationInSeconds: +(process.env.ACCESS_TOKEN_EXPIRATION || 600),
    secret: process.env.ACCESS_TOKEN_SECRET || "secret1",
  },
  logger: {
    logLevel: process.env.LOG_LEVEL || "debug",
  },
  requestLogger: {
    requestLoggerFormat: process.env.REQUEST_LOGGER_FORMAT || MorganFormatTypes.Default,
    keysToHide: process.env.REQUEST_BODY_KEYS_TO_HIDE
      ? (process.env.REQUEST_BODY_KEYS_TO_HIDE || "").split(",")
      : ["password", "token", "accessToken", "accessKey", "authorization"],
  },
  dbConfig: getDbConfig(),
};

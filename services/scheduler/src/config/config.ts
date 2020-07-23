import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { Joi } from "celebrate";
import { DbConfigSchema, DbConfig, getDbConfig } from "./db.config";

export const appConfigSchema = Joi.object({
  port: Joi.number().port().required(),
  applicationType: Joi.string().valid("http").required(),
  apiKeyHeaderName: Joi.string().required(),
  externalManifestPath: Joi.string().required(),
  redisUrl: Joi.string().required(),
  schedulerConfig: Joi.object({
    attempts: Joi.number().min(0).required(),
    timeBetweenAttemptsInMs: Joi.number().min(0).required(),
    queueName: Joi.string().required(),
  }).required(),
  logger: Joi.object({
    logLevel: Joi.string().valid("error", "warn", "help", "info", "debug", "verbose", "silly").required(),
  }).required(),
  requestLogger: Joi.object({
    requestLoggerFormat: Joi.string().required(),
    keysToHide: Joi.array().items(Joi.string()).required(),
  }).required(),
  dbConfig: DbConfigSchema.required(),
}).required();

export const manifestSchema = Joi.array()
  .items(
    Joi.object().keys({
      url: Joi.string().required(),
      name: Joi.string().required(),
      actions: Joi.array()
        .items(
          Joi.object().keys({
            type: Joi.string().required(),
            http: Joi.object().keys({
              uri: Joi.string().required(),
              method: Joi.string().valid("GET", "POST", "PUT", "PATCH", "DELETE").required(),
            }),
          }),
        )
        .required(),
    }),
  )
  .required();

export enum MorganFormatTypes {
  Combined = "combined",
  Common = "common",
  Dev = "dev",
  Short = "short",
  Tiny = "tiny",
  Default = ":remote-addr :method :url :status :response-time ms - req-body :body - api-key :apiKey - authorization :authorization",
}

export type SchedulerConfig = {
  attempts: number;
  timeBetweenAttemptsInMs: number;
  queueName: string;
};

export type AppConfig = {
  port: number;
  applicationType: TransportProtocol;
  apiKeyHeaderName: string;
  redisUrl: string;
  schedulerConfig: SchedulerConfig;
  externalManifestPath: string;
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
  applicationType: TransportProtocol.HTTP,
  apiKeyHeaderName: "x-api-key",
  externalManifestPath: "/app/build/services/scheduler/src/config/external-manifest.json",
  redisUrl: process.env.REDIS_URL || "redis://redis:6379",
  schedulerConfig: {
    attempts: +(process.env.JOB_ATTEMPTS_NUMBER || 3), // number of attempts to try the job until it completes
    timeBetweenAttemptsInMs: +(process.env.TIME_BETWEEN_ATTEMPTS_IN_MS || 5000), // should probably increase after each attempt
    queueName: process.env.QUEUE_NAME || "scheduler-queue",
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

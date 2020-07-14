import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { MailerConfig, TransportType } from "../utils/mail-sender";
import { NodeMailerTransportConfig } from "../utils/transports/smtp-transport";
import { Joi } from "celebrate";

const smtpConfigSchema = Joi.object({
  transportConfig: Joi.object({
    pool: Joi.boolean(),
    host: Joi.string().required(),
    port: Joi.number().port().required(),
    secure: Joi.boolean(),
    auth: Joi.object({
      user: Joi.string().required(),
      pass: Joi.string().required(),
    }),
    debug: Joi.boolean(),
  }).required(),
  templatesRoot: Joi.string().required(),
});

const sendGridConfigSchema = Joi.object({
  authKey: Joi.string().required(),
});

const mailerConfigSchema = Joi.object({
  type: Joi.string().valid("smtp", "sendgrid").required(),
  smtpConfig: smtpConfigSchema.when("type", {
    is: "smtp",
    then: Joi.required(),
  }),
  sendGridConfig: sendGridConfigSchema.when("type", {
    is: "sendgrid",
    then: Joi.required(),
  }),
  batch: Joi.object({
    size: Joi.number().required(),
    period: Joi.number().required(),
    retryAfter: Joi.number().required(),
    lockTriggerDelay: Joi.number().required(),
  }).required(),
});

export const appConfigSchema = Joi.object({
  port: Joi.number().port().required(),
  applicationType: Joi.string().valid("http").required(),
  apiKeyHeaderName: Joi.string().required(),
  mailerConfig: mailerConfigSchema.required(),
  logger: Joi.object({
    logLevel: Joi.string().valid("error", "warn", "help", "info", "debug", "verbose", "silly").required(),
  }).required(),
  requestLogger: Joi.object({
    requestLoggerFormat: Joi.string().required(),
    keysToHide: Joi.array().items(Joi.string()).required(),
  }).required(),
  redisUrl: Joi.string().uri().required(),
  redisPrefix: Joi.string().required(),
  queueName: Joi.string().required(),
}).required();

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
  mailerConfig: MailerConfig;
  logger: {
    logLevel: string;
  };
  requestLogger: {
    requestLoggerFormat: MorganFormatTypes | string;
    keysToHide: string[];
  };
  redisUrl: string;
  redisPrefix: string;
  queueName: string;
};

export const appConfig: AppConfig = {
  port: +(process.env.HTTP_PORT || 50050),
  applicationType: (process.env.PROTOCOL_PROTOCOL || TransportProtocol.HTTP) as TransportProtocol,
  apiKeyHeaderName: "x-api-key",
  mailerConfig: {
    type: (process.env.TRANSPORT_TYPE || "smtp") as TransportType,
    smtpConfig: {
      transportConfig: {
        pool: process.env.TRANSPORT_SMTP_POOL ? process.env.TRANSPORT_SMTP_POOL.toLowerCase() === "true" : true,
        host: process.env.TRANSPORT_SMTP_HOST,
        port: +(process.env.TRANSPORT_SMTP_PORT || 465),
        secure: process.env.TRANSPORT_SMTP_SECURE ? process.env.TRANSPORT_SMTP_SECURE.toLowerCase() === "true" : true,
        auth:
          process.env.TRANSPORT_SMTP_AUTH_USER && process.env.TRANSPORT_SMTP_AUTH_PASSWORD
            ? { user: process.env.TRANSPORT_SMTP_AUTH_USER, pass: process.env.TRANSPORT_SMTP_AUTH_PASSWORD }
            : undefined,
        debug: process.env.TRANSPORT_SMTP_DEBUG ? process.env.TRANSPORT_SMTP_DEBUG.toLowerCase() === "true" : false,
      } as NodeMailerTransportConfig,
      templatesRoot: process.env.TRANSPORT_SMTP_TEMPLATES_ROOT || "/app/services/mailer/mail-templates/",
    },
    sendGridConfig: {
      authKey:
        process.env.TRANSPORT_SENDGRID_AUTH_KEY ||
        "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",
    },
    batch: {
      size: +(process.env.BATCH_SIZE || 1000),
      period: +(process.env.BATCH_PERIOD || 60 * 15),
      retryAfter: 5,
      lockTriggerDelay: 0,
    },
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
  redisUrl: process.env.REDIS_URL || "redis://redis:6379",
  redisPrefix: process.env.REDIS_PREFIX || "rad-modules:security:",
  queueName: "emails",
};

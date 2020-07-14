import { Joi } from "celebrate";

export enum MorganFormatTypes {
  Combined = "combined",
  Common = "common",
  Dev = "dev",
  Short = "short",
  Tiny = "tiny",
  Default = ":remote-addr :method :url :status :response-time ms - req-body :body - api-key :apiKey - authorization :authorization",
}

export type LoggerConfig = {
  logLevel: string;
};

export type RequestLoggerConfig = {
  requestLoggerFormat: MorganFormatTypes | string;
  keysToHide: string[];
};

export const LoggerSchema = Joi.object({
  logLevel: Joi.string().valid("error", "warn", "help", "info", "debug", "verbose", "silly").required(),
});

export const RequestLoggerSchema = Joi.object({
  requestLoggerFormat: Joi.string().required(),
  keysToHide: Joi.array().items(Joi.string()).required(),
});

export const getRequestLoggerConfig = (): RequestLoggerConfig => ({
  requestLoggerFormat: process.env.REQUEST_LOGGER_FORMAT || MorganFormatTypes.Default,
  keysToHide: process.env.REQUEST_BODY_KEYS_TO_HIDE
    ? process.env.REQUEST_BODY_KEYS_TO_HIDE?.split(",")
    : ["password", "token", "accessToken", "accessKey", "authorization"],
});

import { TransportProtocol } from "../../../../shared/enums/transport-protocol";
import { Joi } from "celebrate";
import { DbConfigSchema, DbConfig, getDbConfig } from "./db.config";
import { HttpMethod, JobType, SchedulerRule } from "../scheduler";

export const appConfigSchema = Joi.object({
  port: Joi.number().port().required(),
  applicationType: Joi.string().valid("http").required(),
  apiKeyHeaderName: Joi.string().required(),
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
  initialJobsJsonPath: Joi.string().required(),
}).required();

export const JobCronRegex =
  /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;

export const ScheduleJobSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string()
    .valid(...Object.values(JobType))
    .required(),
  payload: Joi.object({
    method: Joi.string()
      .valid(...Object.keys(HttpMethod))
      .optional(),
    url: Joi.string().required(),
    headers: Joi.object().pattern(/.*/, [Joi.string()]).optional(),
    body: Joi.alternatives().try(Joi.string().allow(""), Joi.object().unknown(), Joi.array()).optional(),
    options: Joi.object({
      compress: Joi.boolean().optional(),
      follow: Joi.number().min(0).optional(),
      size: Joi.number().min(0).optional(),
      timeout: Joi.number().min(0).optional(),
    }).optional(),
  }).required(),
  jobOptions: Joi.object({
    priority: Joi.number().optional(),
    delay: Joi.number().optional(),
    attempts: Joi.number().optional(),
    cron: Joi.string().regex(JobCronRegex).optional(),
    cronStartDate: Joi.date().optional(),
    cronEndDate: Joi.date().optional(),
    cronTimeZone: Joi.string().optional(),
    cronLimit: Joi.number().optional(),
    backoff: Joi.number().optional(),
    lifo: Joi.boolean().optional(),
    timeout: Joi.number().optional(),
    removeOnComplete: Joi.boolean().optional(),
    removeOnFail: Joi.boolean().optional(),
    stackTraceLimit: Joi.number().optional(),
  }).optional(),
  startImmediately: Joi.boolean().optional(),
  rule: Joi.string()
    .valid(...Object.values(SchedulerRule))
    .optional(),
});

export const InitialJobsSchema = Joi.array().items(ScheduleJobSchema).required();

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
  logger: {
    logLevel: string;
  };
  requestLogger: {
    requestLoggerFormat: MorganFormatTypes | string;
    keysToHide: string[];
  };
  dbConfig: DbConfig;
  initialJobsJsonPath: string;
};

export const appConfig: AppConfig = {
  port: 50050,
  applicationType: TransportProtocol.HTTP,
  apiKeyHeaderName: "x-api-key",
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
  initialJobsJsonPath: process.env.INITIAL_JOBS_JSON_PATH || "/app/services/scheduler/init-data-volume/jobs.json",
};

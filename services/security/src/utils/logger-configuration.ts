import { LoggerOptions, transports, format } from "winston";

const logFormat = format.printf(({ level, message, meta }) => {
  const stack = meta && meta.stack ? meta.stack : undefined;

  return JSON.stringify({
    "@timestamp": new Date().toISOString(),
    "@version": 1,
    application: process.env.APP_NAME,
    environment: process.env.NODE_ENV,
    host: process.env.HOST,
    message,
    stack,
    severity: level,
    type: "stdin",
  });
});

export function loggerConfiguration(logLevel: string): LoggerOptions {
  return {
    exitOnError: false,
    level: logLevel,
    format: format.combine(format.splat(), logFormat),
    transports: [new transports.Console()],
  };
}

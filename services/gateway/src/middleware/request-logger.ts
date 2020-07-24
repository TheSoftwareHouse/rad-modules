import * as _ from "lodash";
import * as morgan from "morgan";
import { Request } from "express";
import { appConfig, MorganFormatTypes } from "../config/config";

const qs = require("qs");

interface RequestLoggerProps {
  requestLoggerFormat: MorganFormatTypes;
  loggerStream: morgan.StreamOptions;
}

export const deepCloneAndHideKeys = (objectToClone: any, keysToHide: string[]) =>
  _.cloneDeepWith(objectToClone, (value: any, key: number | string | undefined) =>
    keysToHide.includes(key ? key.toString() : "") ? `Hidden property, type = ${typeof value}` : undefined,
  );

const displayAllowedPropertiesFromBody = (body: any) => {
  const { keysToHide } = appConfig.requestLogger;

  if (keysToHide.length) {
    const bodyDeepCloneWithHiddenKeys = deepCloneAndHideKeys(body, keysToHide);
    return JSON.stringify(bodyDeepCloneWithHiddenKeys);
  }

  return JSON.stringify(body);
};

const obfuscateString = (value: string) => `Hidden, last six chars: ${value.slice(-6)}`;

const tryGetHeaderValue = (req: Request, headerName: string) => {
  const value = req.headers[headerName] as string;
  return value ? obfuscateString(value) : "unknown";
};

export const requestLogger = ({ requestLoggerFormat, loggerStream }: RequestLoggerProps) => {
  morgan.token("body", (req) => {
    const { body } = req;
    if (body && Object.keys(body).length) {
      return displayAllowedPropertiesFromBody(body);
    }
    return "no-body";
  });

  morgan.token("url", (req) => {
    const { keysToHide } = appConfig.requestLogger;
    const url = req.originalUrl ?? req.url;
    if (keysToHide.length && !_.isEmpty(req.query)) {
      const queryWithHiddenKeys = deepCloneAndHideKeys(req.query, keysToHide);
      const queryStringWithHiddenKeys = qs.stringify(queryWithHiddenKeys, { encode: false });
      const urlPath = url.split("?")[0];
      return `${urlPath}?${queryStringWithHiddenKeys}`;
    }
    return url;
  });

  morgan.token("apiKey", (req) => {
    return tryGetHeaderValue(req, appConfig.apiKeyHeaderName);
  });

  morgan.token("authorization", (req) => {
    return tryGetHeaderValue(req, "authorization");
  });

  return morgan(requestLoggerFormat, { stream: loggerStream });
};

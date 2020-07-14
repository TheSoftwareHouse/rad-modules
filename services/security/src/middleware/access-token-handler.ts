import { Request, RequestHandler } from "express";
import { BearerToken } from "../tokens/bearer-token";
import { appConfig } from "../config/config";

export const accessTokenHandler: RequestHandler = (req: Request, res, next) => {
  const { authorization = "" } = req.headers;
  const apiKey = req.headers[appConfig.apiKeyHeaderName];
  const { "X-SECURITY-TOKEN": xSecurityToken = "" } = req.cookies;

  if (apiKey) {
    res.locals.apiKey = apiKey;
    return next();
  }

  const accessToken = authorization
    ? BearerToken.fromHeader(authorization).getToken()
    : BearerToken.fromCookieOrString(xSecurityToken).getToken();
  res.locals.accessToken = accessToken;
  return next();
};

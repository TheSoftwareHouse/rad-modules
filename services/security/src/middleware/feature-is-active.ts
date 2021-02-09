import { Request, RequestHandler } from "express";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { appConfig, AuthenticationStrategy } from "../config/config";
import { HttpError } from "../errors/http.error";

export const featureIsActiveHandler: RequestHandler = (req: Request, res, next) => {
  if (req.baseUrl === "/api/keycloak" && appConfig.authenticationStrategy !== AuthenticationStrategy.Keycloak) {
    return next(new HttpError(ReasonPhrases.METHOD_NOT_ALLOWED, StatusCodes.METHOD_NOT_ALLOWED));
  }
  return next();
};

import { Request, Response, NextFunction } from "express";
import { AccessKeyRepository } from "../repositories/access-key.repostiory";
import { StatusCodes } from "http-status-codes";
import { HttpError } from "../errors/http.error";

interface XApiKeyHandlerProps {
  accessKeyRepository: AccessKeyRepository;
  apiKeyHeaderName: string;
}

export const xApiKeyResponseFactory = (req: Request) => {
  const actionNameFromPath = req.path.split("/").pop();
  switch (actionNameFromPath) {
    case "has-attributes":
      return {
        hasAllAttributes: true,
        ownedAttributes: req?.body?.attributes,
      };
    case "is-authenticated":
      return {
        isAuthenticated: true,
      };
    case "has-access":
      return { hasAccess: true };
    default:
      throw new HttpError("Invalid operation in xApiKeyResponseFactory", StatusCodes.INTERNAL_SERVER_ERROR);
  }
};

export const xApiKeyHandler = ({ accessKeyRepository, apiKeyHeaderName }: XApiKeyHandlerProps) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers[apiKeyHeaderName];
    const key = await accessKeyRepository.findByApiKey(apiKey as string);
    if (key) {
      return res.json(xApiKeyResponseFactory(req));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

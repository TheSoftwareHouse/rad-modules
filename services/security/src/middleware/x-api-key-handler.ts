import { Request, Response, NextFunction } from "express";
import { AccessKeyRepository } from "../repositories/access-key.repostiory";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";
import { HttpError } from "../errors/http.error";

interface xApiKeyHandlerProps {
  accessKeyRepository: AccessKeyRepository;
  apiKeyHeaderName: string;
}

export const xApiKeyResponseFactory = (req: Request) => {
  const actionNameFromPath = req.path.split("/").pop();

  switch (actionNameFromPath) {
    case "has-attribute":
      return {
        hasAllAttributes: true,
        ownedAttributes: ((req.query.attributes as string) || "").split(",").map((attribute) => attribute.trim()),
      };
    case "is-authenticated":
      return {
        isAuthenticated: true,
      };
    case "has-access":
      return { hasAccess: true };
    default:
      throw new HttpError("Invalid operation in xApiKeyResponseFactory", INTERNAL_SERVER_ERROR);
  }
};

export const xApiKeyHandler = ({ accessKeyRepository, apiKeyHeaderName }: xApiKeyHandlerProps) => async (
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

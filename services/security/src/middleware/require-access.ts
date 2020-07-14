import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthenticationClient } from "../app/features/users/strategies/authentication/authentication-client.types";
import { UnathorizedError } from "../errors/unathorized.error";
import { AccessKeyRepository } from "../repositories/access-key.repostiory";
import { AuthorizationClient } from "../ACL/authorization-client.types";

export type RequireAccessFactory = (accessAttribute: string) => RequestHandler;

interface requireAdminAccessProps {
  authenticationClient: AuthenticationClient;
  authorizationClient: AuthorizationClient;
  accessKeyRepository: AccessKeyRepository;
}

export const requireAccess = ({
  authenticationClient,
  authorizationClient,
  accessKeyRepository,
}: requireAdminAccessProps) => (accessAttribute: string): RequestHandler => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken, apiKey } = res.locals;
    if (apiKey) {
      const key = await accessKeyRepository.findByApiKey(apiKey as string);
      if (!key) {
        throw new UnathorizedError("Wrong access key");
      }

      return next();
    }

    const isAuthenticated = await authenticationClient.isAuthenticated(accessToken);

    if (!isAuthenticated) {
      throw new UnathorizedError("Unauthorized");
    }

    const hasAccess = await authorizationClient.hasAccess(accessToken, accessAttribute);

    if (!hasAccess) {
      throw new UnathorizedError("User has no access");
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

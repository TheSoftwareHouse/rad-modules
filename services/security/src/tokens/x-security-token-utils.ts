import { Request, Response } from "express";
import { TokenConfig } from "../config/config";
import { Logger } from "@tshio/logger";
import { BearerToken } from "./bearer-token";
import { AuthenticationClient } from "../app/features/users/strategies/authentication/authentication-client.types";

interface XSecurityTokenUtilsProps {
  refreshTokenConfig: TokenConfig;
  authenticationClient: AuthenticationClient;
  logger: Logger;
}

export class XSecurityTokenUtils {
  constructor(private dependencies: XSecurityTokenUtilsProps) {}

  private xSecurityTokenName: string = "X-SECURITY-TOKEN";

  private xSecurityRefreshTokenName: string = "X-SECURITY-REFRESH-TOKEN";

  public getXSecurityTokens(req: Request) {
    const { [this.xSecurityTokenName]: xSecurityToken = "" } = req.cookies;
    const { [this.xSecurityRefreshTokenName]: xSecurityRefreshToken = "" } = req.cookies;

    return { xSecurityToken, xSecurityRefreshToken };
  }

  public addXSecurityTokenToCookie(accessToken: string, refreshToken: string, res: Response) {
    const { refreshTokenConfig } = this.dependencies;
    const cookieRefreshOptions = {
      maxAge: 1000 * refreshTokenConfig.expirationInSeconds,
    };

    // Both cookies need to has the same expiration time to be able to refresh them
    res.cookie(this.xSecurityTokenName, accessToken, cookieRefreshOptions);
    res.cookie(this.xSecurityRefreshTokenName, refreshToken, cookieRefreshOptions);
  }

  public async tryAddFreshTokensToCookie(req: Request, res: Response) {
    const { authenticationClient, logger } = this.dependencies;
    try {
      const { [this.xSecurityTokenName]: xSecurityToken = "" } = req.cookies;
      const { [this.xSecurityRefreshTokenName]: xSecurityRefreshToken = "" } = req.cookies;
      const accessToken = BearerToken.fromCookieOrString(xSecurityToken);
      const refreshToken = BearerToken.fromCookieOrString(xSecurityRefreshToken);

      const {
        accessToken: freshAccessToken,
        refreshToken: freshRefreshToken,
      } = await authenticationClient.refreshToken(accessToken.getToken(), refreshToken.getToken());

      this.addXSecurityTokenToCookie(freshAccessToken, freshRefreshToken, res);

      return { accessToken: freshAccessToken, refreshToken: freshRefreshToken };
    } catch (err) {
      logger.error(err);
      return res.redirect("/admin/admin-login-view");
    }
  }
}

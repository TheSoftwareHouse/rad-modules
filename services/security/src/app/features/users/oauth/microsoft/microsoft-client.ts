import { decode } from "jsonwebtoken";
import { MicrosoftClientConfig } from "../../../../../config/config";
import { OAuthClient, OAuthDefaultLogin, OAuthLogin, OAuthLoginIdToken, OAuthUser } from "../client.types";
import fetch from "node-fetch";
import * as queryString from "querystring";
import { HttpError } from "../../../../../errors/http.error";
import { FORBIDDEN, INTERNAL_SERVER_ERROR } from "http-status-codes";

interface MicrosoftClientProps {
  microsoftClientConfig: MicrosoftClientConfig;
}

const getDomainFromEmail = (email: string) => email.split("@").pop() ?? "";

export class MicrosoftClient implements OAuthClient {
  constructor(private dependencies: MicrosoftClientProps) {}

  private TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";

  async login(oauthLogin: OAuthLogin): Promise<OAuthUser> {
    const { clientId, secret, allowedDomains } = this.dependencies.microsoftClientConfig;
    const { code, redirectUrl } = oauthLogin as OAuthDefaultLogin;

    return fetch(this.TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${clientId}&scope=openid&code=${code}&redirect_uri=${redirectUrl}&grant_type=authorization_code&client_secret=${queryString.escape(
        secret,
      )}`,
    })
      .then(async (response) => {
        const data = await response.json();

        if (response.status >= 400) {
          throw new HttpError(data.error, response.status);
        }
        return data;
      })
      .then(async (tokens) => {
        const tokenDecoded: any = await Promise.resolve(decode(tokens.id_token)).catch(() => {
          throw new HttpError("Wrong token", FORBIDDEN);
        });

        if (!tokenDecoded.email) {
          throw new HttpError("Wrong email", FORBIDDEN);
        }

        const userDomain = getDomainFromEmail(tokenDecoded.email);

        if (allowedDomains.length > 0 && !allowedDomains.includes(userDomain)) {
          throw new HttpError(
            `Domain: ${userDomain} is not allowed. Supported domains are: ${allowedDomains.join(",")}`,
            FORBIDDEN,
          );
        }

        return tokenDecoded;
      });
  }

  async loginWithToken(_oauthLoginIdToken: OAuthLoginIdToken): Promise<OAuthUser> {
    throw new HttpError("Operation not supported", INTERNAL_SERVER_ERROR);
  }
}

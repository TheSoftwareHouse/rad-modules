import { OAuthClient, OAuthDefaultLogin, OAuthLogin, OAuthLoginIdToken, OAuthUser } from "../client.types";
import fetch from "node-fetch";
import * as queryString from "querystring";
import { HttpError } from "../../../../../errors/http.error";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";
import { FacebookClientConfig } from "../../../../../config/config";

interface FacebookClientProps {
  facebookClientConfig: FacebookClientConfig;
}

export class FacebookClient implements OAuthClient {
  constructor(private dependencies: FacebookClientProps) {}

  async login(oauthLogin: OAuthLogin): Promise<OAuthUser> {
    const { clientId, secret } = this.dependencies.facebookClientConfig;
    const { code, redirectUrl } = oauthLogin as OAuthDefaultLogin;

    const accessResponse: any = await fetch(
      `https://graph.facebook.com/v6.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUrl}&client_secret=${secret}&code=${code}`,
      {
        method: "GET",
      },
    );

    const accessResponseObject = await accessResponse.json();

    const infoParams = queryString.stringify({
      fields: ["email"].join(","),
      access_token: accessResponseObject.access_token,
    });

    const userInfoResponse = await fetch(`https://graph.facebook.com/me?${infoParams}`, {
      method: "GET",
    });

    const { email } = await userInfoResponse.json();

    return {
      email,
    };
  }

  async loginWithToken(_oauthLoginIdToken: OAuthLoginIdToken): Promise<OAuthUser> {
    throw new HttpError("Operation not supported", INTERNAL_SERVER_ERROR);
  }
}

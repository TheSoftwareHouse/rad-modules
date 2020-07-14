import { OAuth2Client } from "google-auth-library";
import { GaxiosError, request } from "gaxios";
import { OAuthClient, OAuthDefaultLogin, OAuthGoogleIdTokenLogin, OAuthLoginIdToken, OAuthUser } from "../client.types";
import { FORBIDDEN, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { HttpError } from "../../../../../errors/http.error";
import { GoogleClientConfig } from "../../../../../config/config";

interface GoogleClientProps {
  googleClientConfig: GoogleClientConfig;
}

const gaxiosErrorToHttpError = (error: GaxiosError) => {
  const message = error.response?.data?.error ?? "Google OAuthClient unknown error";
  const statusCode = error.response?.status ?? INTERNAL_SERVER_ERROR;
  throw new HttpError(message, statusCode);
};

export type UserInfo = {
  hd: string;
  email: string;
  email_verified: boolean;
};

export class GoogleClient implements OAuthClient {
  constructor(private dependencies: GoogleClientProps) {}

  private getEmail(userInfo: UserInfo) {
    const { allowedDomains } = this.dependencies.googleClientConfig;

    if (allowedDomains.length > 0 && !allowedDomains.includes(userInfo.hd)) {
      throw new HttpError(
        `Domain: ${userInfo.hd} is not allowed. Supported domains are: ${allowedDomains.join(",")}`,
        FORBIDDEN,
      );
    }

    if (!userInfo.email_verified) {
      throw new HttpError("Email unverified", FORBIDDEN);
    }

    return {
      email: userInfo.email,
    };
  }

  async login(oauthLogin: OAuthDefaultLogin): Promise<OAuthUser> {
    const { clientId, secret, getUserInfoUrl } = this.dependencies.googleClientConfig;
    const { code, redirectUrl } = oauthLogin;

    const oAuth2Client = new OAuth2Client(clientId, secret, redirectUrl);
    const { tokens } = await oAuth2Client.getToken(code).catch(gaxiosErrorToHttpError);

    await oAuth2Client.setCredentials(tokens);

    const { data } = await oAuth2Client.request({ url: getUserInfoUrl }).catch(gaxiosErrorToHttpError);

    return this.getEmail(data as UserInfo);
  }

  async loginWithToken(oauthLoginIdToken: OAuthLoginIdToken): Promise<OAuthUser> {
    const { getTokenInfoUrl } = this.dependencies.googleClientConfig;
    const { idToken } = oauthLoginIdToken as OAuthGoogleIdTokenLogin;

    const { data } = await request({ url: `${getTokenInfoUrl}?id_token=${idToken}` }).catch(gaxiosErrorToHttpError);

    return this.getEmail(data as UserInfo);
  }
}

import { OAuthClient, OAuthDefaultLogin, OAuthLogin, OAuthLoginIdToken, OAuthUser } from "../client.types";
import fetch from "node-fetch";
import { HttpError } from "../../../../../errors/http.error";
import { StatusCodes } from "http-status-codes";
import { KeycloakClientConfig } from "../../../../../config/config";
import * as jwt from "jsonwebtoken";

interface KeycloakClientProps {
  keycloakClientConfig: KeycloakClientConfig;
}

export class KeycloakClient implements OAuthClient {
  constructor(private dependencies: KeycloakClientProps) {}

  async login(oauthLogin: OAuthLogin): Promise<OAuthUser> {
    const { clientId, clientSecret, keycloakUrl } = this.dependencies.keycloakClientConfig;
    const { code, redirectUrl } = oauthLogin as OAuthDefaultLogin;

    const params = new URLSearchParams();

    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append("client_id", clientId);
    params.append("client_secret", clientSecret);
    params.append("redirect_uri", redirectUrl);
    params.append("scope", "openid");

    const accessResponse: any = await fetch(`${keycloakUrl}/auth/realms/TSH/protocol/openid-connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const accessResponseObject = await accessResponse.json();

    const idToken = jwt.decode(accessResponseObject.id_token) as any;

    if (!idToken.email) {
      throw new HttpError("Unable to read email parameter from decoded id_token jwt", StatusCodes.FORBIDDEN);
    }

    if (!idToken.email_verified) {
      throw new HttpError("Email unverified", StatusCodes.FORBIDDEN);
    }

    return {
      ...accessResponseObject,
      email: idToken.email,
    };
  }

  async loginWithToken(_oauthLoginIdToken: OAuthLoginIdToken): Promise<OAuthUser> {
    throw new HttpError("Operation not supported", StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

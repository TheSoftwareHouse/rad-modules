// import { OAuthClient, OAuthDefaultLogin, OAuthLogin, OAuthLoginIdToken, OAuthUser } from "../client.types";
// import fetch from "node-fetch";
// import * as queryString from "querystring";
// import { HttpError } from "../../../../../errors/http.error";
// import { INTERNAL_SERVER_ERROR } from "http-status-codes";
// import { FacebookClientConfig, KeycloakManagerConfig } from "../../../../../config/config";
//
// interface KeycloakClientProps {
//   keycloakClientConfig: KeycloakManagerConfig;
// }
//
// export class KeycloakClient implements OAuthClient {
//   constructor(private dependencies: KeycloakClientProps) {}
//
//   async login(oauthLogin: OAuthLogin): Promise<OAuthUser> {
//     const { clientId, clientSecret, keycloakUrl } = this.dependencies.keycloakClientConfig;
//     const { code, redirectUrl } = oauthLogin as OAuthDefaultLogin;
//
//     const params = new URLSearchParams();
//
//     params.append("code ", clientId);
//     params.append("grant_type", clientId);
//     params.append("client_id", clientId);
//     params.append("redirect_uri", redirectUrl);
//     const accessResponse: any = await fetch(
//       `${keycloakUrl}/auth/realms/TSH/protocol/openid-connect/token?client_id=${clientId}&grant_type=authorization_code&redirect_uri=${redirectUrl}&client_secret=${clientSecret}&code=${code}`,
//       {
//         method: "POST",
//       },
//     );
//
//     const accessResponseObject = await accessResponse.json();
//
//     const infoParams = queryString.stringify({
//       fields: ["email"].join(","),
//       access_token: accessResponseObject.access_token,
//     });
//
//     const userInfoResponse = await fetch(`https://graph.facebook.com/me?${infoParams}`, {
//       method: "GET",
//     });
//
//     return userInfoResponse.json();
//   }
//
//   async loginWithToken(_oauthLoginIdToken: OAuthLoginIdToken): Promise<OAuthUser> {
//     throw new HttpError("Operation not supported", INTERNAL_SERVER_ERROR);
//   }
// }

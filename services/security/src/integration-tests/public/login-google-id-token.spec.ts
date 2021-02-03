import { BAD_REQUEST, FORBIDDEN, OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { deepEqualOmit } from "../../../../../shared/test-utils";
import { decode } from "jsonwebtoken";
import { GlobalData } from "../bootstrap";
import {
  OAuthClient,
  OAuthDefaultLogin,
  OAuthLoginIdToken,
  OAuthUser,
} from "../../app/features/users/oauth/client.types";
import { HttpError } from "../../errors/http.error";
import { GoogleClient, UserInfo } from "../../app/features/users/oauth/google/google-client";
import { asClass, asValue } from "awilix";
import { appConfig, GoogleClientConfig } from "../../config/config";

interface GoogleClientProps {
  userInfo: {
    email: string;
    hd: string;
    email_verified: boolean;
  };
  googleClientConfig: {
    clientId: string;
    secret: string;
    allowedDomains: string[];
    getUserInfoUrl: string;
    getTokenInfoUrl: string;
  };
}

export class GoogleClientMock implements OAuthClient {
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

  async login(_oauthLogin: OAuthDefaultLogin): Promise<OAuthUser> {
    const { userInfo } = this.dependencies;

    return {
      email: userInfo.email,
    };
  }

  async loginWithToken(_oauthLoginIdToken: OAuthLoginIdToken): Promise<OAuthUser> {
    const { userInfo } = this.dependencies;

    return this.getEmail(userInfo);
  }
}

describe("login-google-id-token.action", () => {
  const GLOBAL = {} as GlobalData;

  const googleClientConfigMock = {
    clientId: "",
    secret: "",
    allowedDomains: ["tsh.io"],
    getUserInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
    getTokenInfoUrl: "https://oauth2.googleapis.com/tokeninfo",
  };

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Login endpoint should return accessToken and refreshToken", async () => {
    const { app, container } = GLOBAL.bootstrap;
    container.register("googleClientConfig", asValue(googleClientConfigMock));
    container.register("userInfo", asValue({ email: "test@tsh.io", email_verified: true, hd: "tsh.io" }));
    container.register("googleClient", asClass(GoogleClientMock));

    const { body } = await request(app)
      .post("/api/public/auth/login/google-id-token")
      .send({ idToken: "some token" })
      .expect("Content-Type", /json/)
      .expect(OK);

    assert(decode(body.accessToken));
    assert(decode(body.refreshToken));

    container.register("googleClientConfig", asValue(appConfig.oauth.googleClientConfig));
    container.register("googleClient", asClass(GoogleClient));
  });

  it("Should not authenticate a user with not verified email", async () => {
    const { app, container } = GLOBAL.bootstrap;

    container.register("googleClientConfig", asValue(googleClientConfigMock));
    container.register("userInfo", asValue({ email: "test@tsh.io", email_verified: false, hd: "tsh.io" }));
    container.register("googleClient", asClass(GoogleClientMock));

    await request(app)
      .post("/api/public/auth/login/google-id-token")
      .send({ idToken: "some token" })
      .expect("Content-Type", /json/)
      .expect(deepEqualOmit({ error: "Email unverified" }))
      .expect(FORBIDDEN);

    container.register("googleClientConfig", asValue(appConfig.oauth.googleClientConfig));
    container.register("googleClient", asClass(GoogleClient));
  });

  it("Should not authenticate a user with not allowed domain", async () => {
    const { app, container } = GLOBAL.bootstrap;

    const wrongDomain = "wrong.hd";

    container.register("googleClientConfig", asValue(googleClientConfigMock));
    container.register("userInfo", asValue({ email: "test@tsh.io", email_verified: false, hd: wrongDomain }));
    container.register("googleClient", asClass(GoogleClientMock));

    const googleClientConfig = container.resolve("googleClientConfig") as GoogleClientConfig;

    await request(app)
      .post("/api/public/auth/login/google-id-token")
      .send({ idToken: "some token" })
      .expect("Content-Type", /json/)
      .expect(
        deepEqualOmit({
          error: `Domain: ${wrongDomain} is not allowed. Supported domains are: ${googleClientConfig.allowedDomains.join(
            ",",
          )}`,
        }),
      )
      .expect(FORBIDDEN);

    container.register("googleClientConfig", asValue(appConfig.oauth.googleClientConfig));
    container.register("googleClient", asClass(GoogleClient));
  });

  it("Should not authenticate a user with bad token", () => {
    const { app } = GLOBAL.bootstrap;
    return request(app)
      .post("/api/public/auth/login/google-id-token")
      .send({ idToken: "wrong token" })
      .expect("Content-Type", /json/)
      .expect(deepEqualOmit({ error: "invalid_token" }))
      .expect(BAD_REQUEST);
  });
});

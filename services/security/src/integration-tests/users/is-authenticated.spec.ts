import { OK, UNAUTHORIZED, CREATED } from "http-status-codes";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { appConfig } from "../../config/config";
import { usersFixture } from "../fixtures/users.fixture";
import { UsersResponses, BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit } from "../../../../../shared/test-utils";
import { asValue } from "awilix";

const [userWithAdminPanelAttr, normalUser, superAdminUser] = usersFixture; // eslint-disable-line

describe("is-authenticated.action", () => {
  const GLOBAL = {} as GlobalData;
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  let accessTokenConfigOriginal: any;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return valid response if user is authenticated", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(normalUser.username, normalUser.password);

    return request(app)
      .get("/api/users/is-authenticated")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK, UsersResponses.isAuthenticated);
  });

  it("Should return valid response if access token expired", async () => {
    const { container, authClient, app } = GLOBAL.bootstrap;

    accessTokenConfigOriginal = container.resolve("accessTokenConfig");
    container.register(
      "accessTokenConfig",
      asValue({
        expirationInSeconds: 1,
        secret: "secret1",
      }),
    );

    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    await sleep(1000);

    await request(app)
      .get("/api/users/is-authenticated")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(UsersResponses.isNotAuthenticated));

    container.register("accessTokenConfig", asValue(accessTokenConfigOriginal));
  });

  it("Should throw UNAUTHORIZED error if wrong x-access-key header", () => {
    const { app } = GLOBAL.bootstrap;

    return request(app)
      .get("/api/users/is-authenticated")
      .set(appConfig.apiKeyHeaderName, "wrongApiKey")
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.tokenMissingOrInvalid));
  });

  it("Should throw UNAUTHORIZED error if x-access-key or authorization header is missing", () => {
    const { app } = GLOBAL.bootstrap;

    return request(app)
      .get("/api/users/is-authenticated")
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.tokenMissingOrInvalid));
  });

  it("Should return response with isAuthenticated:true when x-api-key in header", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const { body } = await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { apiKey } = body;

    return request(app)
      .get("/api/users/is-authenticated")
      .set(appConfig.apiKeyHeaderName, apiKey)
      .expect("Content-Type", /json/)
      .expect(OK, UsersResponses.isAuthenticated);
  });
});

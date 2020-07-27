import { CREATED, UNAUTHORIZED } from "http-status-codes";
import * as request from "supertest";
import * as assert from "assert";
import { deepEqualOmit, isUuid, isValidTokenType, isNotEmptyString } from "../test-utils";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { GlobalData } from "../bootstrap";
import { appConfig } from "../../config/config";

describe("Access API key tests", () => {
  const GLOBAL = {} as GlobalData;
  const username = "superadmin";
  const password = "superadmin";

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should create new access API key", async () => {
    const { authClient, app, apiKeyRegex } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    return request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED)
      .then((data) => (data.body.apiKey.match(apiKeyRegex) === null ? assert.fail() : assert.ok("ok")));
  });

  it("Should return response body with defined props", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    const { body } = await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    assert(isNotEmptyString(body.apiKey) && isUuid(body.apiKey));
    assert(isNotEmptyString(body.type) && isValidTokenType(body.type));
    assert(isNotEmptyString(body.createdBy));
  });

  it("Should allow use secure endpoints with access key", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    const { body } = await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { apiKey } = body;

    const { body: addUserBody } = await request(app)
      .post("/api/users/add-user")
      .set(appConfig.apiKeyHeaderName, apiKey)
      .send({ username: "NewInActiveUser", password: "randomPassword" })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    assert(isNotEmptyString(addUserBody.newUserId) && isUuid(addUserBody.newUserId));
  });

  it("Should throw error if wrong access key provided", async () => {
    const { app } = GLOBAL.bootstrap;

    return request(app)
      .post("/api/users/add-user")
      .set(appConfig.apiKeyHeaderName, "WrongAccessKey")
      .send({ username: "NewInActiveUser", password: "randomPassword" })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.accessKeyWrong));
  });
});

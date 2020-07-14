import { CREATED, OK } from "http-status-codes";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { appConfig } from "../../config/config";
import { UsersResponses } from "../fixtures/response.fixture";

describe("has-access.action", () => {
  const GLOBAL = {} as GlobalData;
  const username = "superadmin";
  const password = "superadmin";

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return has access when request made with x-access-key", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    const { body } = await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { apiKey } = body;

    return request(app)
      .get("/api/users/has-access?resource=resource1")
      .set(appConfig.apiKeyHeaderName, apiKey)
      .expect("Content-Type", /json/)
      .expect(OK, UsersResponses.hasAccess);
  });
});

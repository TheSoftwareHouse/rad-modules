import { StatusCodes } from "http-status-codes";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { appConfig } from "../../config/config";
import { UsersResponses } from "../fixtures/response.fixture";

describe("has-access.action", () => {
  const GLOBAL = {} as GlobalData;
  const username = "superadmin";
  const password = "superadmin";

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return has access when request made with x-access-key", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    const { body } = await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(StatusCodes.CREATED);

    const { apiKey } = body;

    return request(app)
      .post("/api/users/has-access")
      .set(appConfig.apiKeyHeaderName, apiKey)
      .send({ resources: ["resource1"] })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.OK, UsersResponses.hasAccess);
  });
});

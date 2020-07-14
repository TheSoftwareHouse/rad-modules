import { UNAUTHORIZED, OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit } from "../test-utils";
import { decode } from "jsonwebtoken";
import { GlobalData } from "../bootstrap";

/*
    In some test cases especially in reset password flow
    normal user uses accessToken from userWithAdminPanelAttr/superAdmin
    in the real word, the accessToken also will be generated
    from /api/tokens/create-access-key and /api/tokens/generate-token endpoints
    the accessToken will have higher privileges to do operations that normal user can't
*/

const normalUser = usersFixture[1];

describe("refresh-token.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should refresh a token for a user", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken, refreshToken } = await authClient.login(normalUser.username, normalUser.password);

    const { body: bodyWithRefreshedTokens } = await request(app)
      .post("/api/users/refresh-token")
      .send({ refreshToken, accessToken })
      .expect("Content-Type", /json/)
      .expect(OK);

    assert(decode(bodyWithRefreshedTokens.accessToken));
    assert(decode(bodyWithRefreshedTokens.refreshToken));
  });

  it("Should not refresh a token when provided an invalid refresh token.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(normalUser.username, normalUser.password);

    return request(app)
      .post("/api/users/refresh-token")
      .send({ refreshToken: "invalid", accessToken })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.refreshTokenFailed));
  });
});

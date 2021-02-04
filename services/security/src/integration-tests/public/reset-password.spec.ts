import { StatusCodes } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit, isNotEmptyString } from "../../../../../shared/test-utils";
import { GlobalData } from "../bootstrap";
import { decode } from "jsonwebtoken";

const [userWithAdminPanelAttr, normalUser] = usersFixture;

describe("public reset-password.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should not reset user password with bad request", () => {
    const { app } = GLOBAL.bootstrap;
    return request(app)
      .post("/api/public/auth/reset-password/wrongToken123")
      .send({ newPassword: "123" })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(
          response.body.error.details[0].message,
          BadRequestResponses.passwordNotMatchRegexpErrorFactory("newPassword").error,
        );
      });
  });

  it("Should not reset a password with bad pattern", async () => {
    const tooShortPassword = "1234";
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect(StatusCodes.CREATED);

    const { resetPasswordToken } = response.body;
    assert(isNotEmptyString(resetPasswordToken));

    return request(app)
      .post(`/api/public/auth/reset-password/${resetPasswordToken}`)
      .send({ newPassword: tooShortPassword })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.BAD_REQUEST)
      .expect((res: any) => {
        assert.strictEqual(
          res.body.error.details[0].message,
          BadRequestResponses.passwordNotMatchRegexpErrorFactory("newPassword").error,
        );
      });
  });

  it("Should reset user password and not allow to login with old password", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const oldPassword = normalUser.password;
    const newPassword = "Some new password";

    const response = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect(StatusCodes.CREATED);

    const { resetPasswordToken } = response.body;

    await request(app)
      .post(`/api/public/auth/reset-password/${resetPasswordToken}`)
      .send({ newPassword })
      .expect(StatusCodes.CREATED);

    await request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: oldPassword })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.wrongUsernameOrPassword));

    const { body: loginBodyNewCredential } = await request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: newPassword })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.OK);

    assert(decode(loginBodyNewCredential.accessToken));
    assert(decode(loginBodyNewCredential.refreshToken));
  });
});

import { UNAUTHORIZED, OK, BAD_REQUEST } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses, UsersResponses } from "../fixtures/response.fixture";
import { deepEqualOmit } from "../../../../../shared/test-utils";
import { decode } from "jsonwebtoken";
import { GlobalData } from "../bootstrap";

const normalUser = usersFixture[1];

describe("set-password.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should set new password if a user provide valid new and old password", async () => {
    const { app } = GLOBAL.bootstrap;
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: normalUser.password })
      .expect(OK);

    const { accessToken } = loginResponse.body;

    const { body } = await request(app)
      .post("/api/users/set-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ oldPassword: normalUser.password, newPassword: "newPassw0rd" })
      .expect(OK);

    assert(typeof body.passwordChanged === "boolean");
    assert(body.passwordChanged === true);

    return request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: "newPassw0rd" })
      .expect(OK);
  });

  it("Should return bad request if a user provide invalid new password for password regexp", async () => {
    const { app } = GLOBAL.bootstrap;
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: normalUser.password })
      .expect(OK);

    const { accessToken } = loginResponse.body;

    return request(app)
      .post("/api/users/set-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ oldPassword: "newPassw0rd", newPassword: "pass" })
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(
          response.body.error.details[0].message,
          BadRequestResponses.passwordNotMatchRegexpErrorFactory("newPassword").error,
        );
      });
  });

  it("Should return bad request if a user provide invalid old password", async () => {
    const { app } = GLOBAL.bootstrap;
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: normalUser.password })
      .expect(OK);

    const { accessToken } = loginResponse.body;

    return request(app)
      .post("/api/users/set-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ oldPassword: "invalidPassword", newPassword: "newPassw0rd" })
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error, BadRequestResponses.passwordCantSetNew.error);
      });
  });

  it("Should return unauthorized error if a user provide invalid token", () => {
    const { app } = GLOBAL.bootstrap;

    return request(app)
      .post("/api/users/set-password")
      .set("Authorization", "Bearer Wrong Token")
      .send({ oldPassword: "invalidPassword", newPassword: "newPassw0rd" })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.tokenMissingOrInvalid));
  });

  it("Should set the new password if a user is super admin and provide valid new password", async () => {
    const { superAdminUser, app } = GLOBAL.bootstrap;

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: superAdminUser.username, password: superAdminUser.password })
      .expect(OK);

    const { accessToken } = loginResponse.body;
    const newPassword = "newPassw0rd123";
    const oldPassword = normalUser.password;

    await request(app)
      .post("/api/users/set-password")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username, newPassword })
      .expect(OK, UsersResponses.passwordChanged);

    await request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: oldPassword })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.wrongUsernameOrPassword));

    const { body: bodyLoginSuccess } = await request(app)
      .post("/api/users/login")
      .send({ username: normalUser.username, password: newPassword })
      .expect(OK);

    assert(decode(bodyLoginSuccess.accessToken));
    assert(decode(bodyLoginSuccess.refreshToken));
  });
});

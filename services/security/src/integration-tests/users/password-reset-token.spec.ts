import { UNAUTHORIZED, CREATED, BAD_REQUEST, NOT_FOUND } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit, isNotEmptyString } from "../test-utils";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr, normalUser] = usersFixture;

/*
    In some test cases especially in reset password flow
    normal user uses accessToken from userWithAdminPanelAttr/superAdmin
    in the real word, the accessToken also will be generated
    from /api/tokens/create-access-key and /api/tokens/generate-token endpoints
    the accessToken will have higher privileges to do operations that normal user can't
*/

describe("password-reset-token.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return password reset token", async () => {
    const { authClient, superAdminUser, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const response = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect(CREATED);

    const { resetPasswordToken } = response.body;

    assert(isNotEmptyString(resetPasswordToken));
  });

  it("Should set token in passwordResetToken for the user in db", async () => {
    const USERNAME = normalUser.username;
    const { authClient, superAdminUser, usersRepository, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const response = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: USERNAME })
      .expect(CREATED);

    const { resetPasswordToken } = response.body;
    const user = await usersRepository.findByUsername(USERNAME);

    assert(isNotEmptyString(resetPasswordToken));
    assert.strictEqual(user?.resetPasswordToken, resetPasswordToken);
  });

  it("Should return unauthorized if token is missing", () => {
    const { app } = GLOBAL.bootstrap;
    return request(app)
      .post("/api/users/password-reset-token")
      .send({ username: "username99" })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.tokenMissingOrInvalid));
  });

  it("Should return unauthorized if token hasn't access", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(normalUser.username, normalUser.password);

    return request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "username99" })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.userHasNoAccess));
  });

  it("Should return unauthorized if token is missing or token hasn't access", () => {
    const { app } = GLOBAL.bootstrap;
    return request(app)
      .post("/api/users/password-reset-token")
      .send({ username: "wrongUsername" })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.tokenMissingOrInvalid));
  });

  it("Should return bad request if a user wants reset password and won't provide a username", () => {
    const { app } = GLOBAL.bootstrap;
    return request(app)
      .post("/api/users/password-reset-token")
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit({ error: '"username" is required' }));
  });

  it("Should return bad request if a user wants reset password and provide bad username", async () => {
    const { authClient, superAdminUser, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    return request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "bad-user-name" })
      .expect("Content-Type", /json/)
      .expect(NOT_FOUND)
      .expect(deepEqualOmit(BadRequestResponses.wrongUsername));
  });

  it("Should reset password if user provide valid token", async () => {
    const { authClient, superAdminUser, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const response = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { resetPasswordToken } = response.body;
    assert(isNotEmptyString(resetPasswordToken));

    return request(app)
      .post(`/api/users/reset-password/${resetPasswordToken}`)
      .send({ newPassword: "newValidPassword123" })
      .expect("Content-Type", /json/)
      .expect(CREATED);
  });

  it("Should set resetPasswordToken to null after successful password reset action", async () => {
    const { authClient, superAdminUser, usersRepository, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const response = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { resetPasswordToken } = response.body;

    await request(app)
      .post(`/api/users/reset-password/${resetPasswordToken}`)
      .send({ newPassword: "newValidPassword123" })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const user = await usersRepository.findByUsername(normalUser.username);

    assert.strictEqual(user?.resetPasswordToken, null);
  });

  it("Should returns different token each time password reset token action is called", async () => {
    const { authClient, superAdminUser, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const firstActionResponse = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { resetPasswordToken: resetPasswordToken1 } = firstActionResponse.body;
    assert(isNotEmptyString(resetPasswordToken1));

    const secondActionResponse = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { resetPasswordToken: resetPasswordToken2 } = secondActionResponse.body;

    assert(isNotEmptyString(resetPasswordToken2));
    assert.notEqual(resetPasswordToken1, resetPasswordToken2);
  });

  it("Should reset a password with random string if no new password in body", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/password-reset-token")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: normalUser.username })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { resetPasswordToken } = response.body;
    assert(isNotEmptyString(resetPasswordToken));

    return request(app)
      .post(`/api/users/reset-password/${resetPasswordToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);
  });
});

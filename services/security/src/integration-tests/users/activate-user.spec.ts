import { CREATED, OK, GONE } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { asValue } from "awilix";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit, isNotEmptyString, isUuid, isDate } from "../../../../../shared/test-utils";
import { GlobalData } from "../bootstrap";
import { Event } from "../../shared/event-dispatcher";
import * as awilix from "awilix";
import { deepStrictEqual } from "assert";

const [userWithAdminPanelAttr] = usersFixture;

describe("activate-user.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should active user", async () => {
    const { authClient, container, usersRepository, app } = GLOBAL.bootstrap;
    const userActivationConfigOriginal = container.resolve("userActivationConfig");
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));

    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: true });

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "NewInActiveUser", password: "randomPassword" })
      .expect(CREATED);

    const { newUserId } = response.body;
    let user = await usersRepository.findById(newUserId);

    if (user) {
      const { activationToken } = user;
      const { body } = await request(app).post(`/api/users/activate-user/${activationToken}`).expect(OK);

      assert(isNotEmptyString(body.userId) && isUuid(body.userId));
      assert(typeof body?.isActive === "boolean");
      assert(body?.isActive === true);

      user = await usersRepository.findById(newUserId);
      assert(user?.isActive === true);
    }

    container.register("userActivationConfig", asValue(userActivationConfigOriginal));
  });

  it("Should user's deactivate date be null after user reactivation ", async () => {
    const { authClient, container, usersRepository, app } = GLOBAL.bootstrap;
    const userActivationConfigOriginal = container.resolve("userActivationConfig");
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));

    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: true });

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "UserToDeactivateAndActivate", password: "randomPassword" })
      .expect(CREATED);

    const { newUserId } = response.body;
    let user = await usersRepository.findById(newUserId);

    if (user) {
      const { activationToken } = user;
      const { body: bodyActivate } = await request(app).post(`/api/users/activate-user/${activationToken}`).expect(OK);

      assert(isNotEmptyString(bodyActivate.userId) && isUuid(bodyActivate.userId));
      assert(typeof bodyActivate.isActive === "boolean");
      assert(bodyActivate.isActive === true);

      const { body: bodyDeactivate } = await request(app)
        .post("/api/users/deactivate-user")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userId: newUserId })
        .expect(OK);

      assert(isNotEmptyString(bodyDeactivate.userId) && isUuid(bodyDeactivate.userId));
      assert(typeof bodyDeactivate.isActive === "boolean");
      assert(bodyDeactivate.isActive === false);
      assert(isNotEmptyString(bodyDeactivate.deactivationDate));

      user = await usersRepository.findById(newUserId);
      assert(isDate(user?.deactivationDate));
      assert(isNotEmptyString(user?.activationToken));
      assert(isDate(user?.activationTokenExpireDate));

      const refreshEndpointResponse = await request(app)
        .post("/api/users/refresh-user-active-token")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userId: newUserId })
        .expect(OK);

      const { activationToken: newToken } = refreshEndpointResponse.body;
      assert(isNotEmptyString(newToken));

      await request(app).post(`/api/users/activate-user/${newToken}`).expect(OK);

      user = await usersRepository.findById(newUserId);

      assert.strictEqual(user?.deactivationDate, null);
      assert.strictEqual(user?.activationToken, null);
      assert.strictEqual(user?.activationTokenExpireDate, null);
    }

    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: false });

    container.register("userActivationConfig", asValue(userActivationConfigOriginal));
  });

  it("Should trigger UserActivated", async () => {
    let triggeredEvent: Event = { name: "Event", payload: {} };
    GLOBAL.bootstrap.container.register({
      httpEventHandler: awilix.asFunction(() => (event: Event) => {
        triggeredEvent = event;
      }),
    });
    const { authClient, container, usersRepository, app } = GLOBAL.bootstrap;
    const userActivationConfigOriginal = container.resolve("userActivationConfig");
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));
    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: true });
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "NewInActiveUser", password: "randomPassword" })
      .expect(CREATED);
    const user = (await usersRepository.findById(response.body.newUserId))!;

    const { body } = await request(app).post(`/api/users/activate-user/${user.activationToken}`).expect(OK);

    assert(isNotEmptyString(body.userId) && isUuid(body.userId));
    assert(typeof body?.isActive === "boolean");
    assert(body?.isActive === true);

    deepStrictEqual(triggeredEvent, {
      name: "UserActivated",
      payload: {
        userId: user!.id,
        attributes: [],
      },
    });

    container.register("userActivationConfig", asValue(userActivationConfigOriginal));
  });
});

describe("User tests with mocked Date.now one week time in future", () => {
  const WEEK_DAYS = 7;
  const originalDateNow = Date.now;
  const GLOBAL = {} as GlobalData;

  function mockDateNow() {
    const now = new Date();
    now.setDate(now.getDate() + WEEK_DAYS);

    return now.getTime();
  }

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
    Date.now = mockDateNow;
  });

  it("Should return error when activate token expired", async () => {
    const { authClient, container, usersRepository, app } = GLOBAL.bootstrap;
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));

    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: true });

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "NewInActiveUserWithExpiredToken", password: "randomPassword" })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { newUserId } = response.body;

    const user = await usersRepository.findById(newUserId);

    if (user) {
      const { activationToken } = user;
      return request(app)
        .post(`/api/users/activate-user/${activationToken}`)
        .expect("Content-Type", /json/)
        .expect(GONE)
        .expect(deepEqualOmit(BadRequestResponses.tokenExpired));
    }
    return assert.fail();
  });

  after(() => {
    Date.now = originalDateNow;
  });
});

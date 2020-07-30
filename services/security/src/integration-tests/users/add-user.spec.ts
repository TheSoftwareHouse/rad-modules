import { CREATED, CONFLICT, BAD_REQUEST } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { asValue } from "awilix";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit, isNotEmptyString, isUuid } from "../../../../../shared/test-utils";
import { GlobalData } from "../bootstrap";
import { TEST_ATTRIBUTE_NAME } from "../fixtures/policies.fixture";
import { deepStrictEqual } from "assert";
import { Event } from "../../shared/event-dispatcher";
import * as awilix from "awilix";

const [userWithAdminPanelAttr] = usersFixture;

describe("add-user.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should create a user", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const { body } = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "randomUserName", password: "randomPassword" })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    assert(isNotEmptyString(body?.newUserId));
    assert(isUuid(body?.newUserId));
  });

  it("Should not create a user with incorrect password pattern", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "randomUserName", password: "123" })
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit(BadRequestResponses.passwordNotMatchRegexpErrorFactory("password")));
  });

  it("Should not create a user with already existing username", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const username = "randomUserName";
    const password = "randomPassword";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username, password })
      .expect(CREATED);

    return request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username, password })
      .expect("Content-Type", /json/)
      .expect(CONFLICT)
      .expect(deepEqualOmit(BadRequestResponses.userNameAlreadyExistsErrorFactory(username)));
  });

  it("Should create a inactive user and active token when app config isUserActivationNeeded set to true", async () => {
    const { authClient, usersRepository, container, app } = GLOBAL.bootstrap;
    const userActivationConfigOriginal = container.resolve("userActivationConfig");
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));

    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: true });

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "InActiveUser", password: "randomPassword" })
      .expect(CREATED);

    const { newUserId } = response.body;
    assert(isNotEmptyString(newUserId));
    assert(isUuid(newUserId));

    const user = await usersRepository.findById(newUserId);

    assert(typeof user?.isActive === "boolean");
    assert(user?.isActive === false);
    assert(isNotEmptyString(user?.activationToken));

    container.register("userActivationConfig", asValue(userActivationConfigOriginal));
  });

  it("Should create a user with attributes", async () => {
    const { authClient, usersRepository, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const { body } = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "randomUserName", password: "randomPassword", attributes: [TEST_ATTRIBUTE_NAME] })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { newUserId } = body;
    assert(isNotEmptyString(newUserId));
    assert(isUuid(newUserId));

    const newUser = await usersRepository.findById(newUserId);

    assert(Array.isArray(newUser?.attributes));
    assert(newUser?.attributes.every((attribute: any) => isNotEmptyString(attribute.name)));
    assert(newUser?.attributes.some((attribute: any) => attribute.name === TEST_ATTRIBUTE_NAME));
  });

  it("Should return error if trying to create user with empty attributes array", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "randomUserName", password: "randomPassword", attributes: [] })
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit({ error: '"attributes" does not contain 1 required value(s)' }));
  });

  it("Should trigger UserAdded", async () => {
    let triggeredEvent: Event = { name: "Event", payload: {} };
    GLOBAL.bootstrap.container.register({
      httpEventHandler: awilix.asFunction(() => (event: Event) => {
        triggeredEvent = event;
      }),
    });
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const { body } = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "randomUserName", password: "randomPassword" })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    deepStrictEqual(triggeredEvent, {
      name: "UserAdded",
      payload: {
        userId: body?.newUserId,
        attributes: [],
      },
    });
  });
});

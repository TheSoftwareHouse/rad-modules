import { StatusCodes } from "http-status-codes";
import * as request from "supertest";
import { v4 } from "uuid";
import * as assert from "assert";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses, UsersResponses } from "../fixtures/response.fixture";
import { GlobalData } from "../bootstrap";
import { deepEqualOmit } from "../../../../../shared/test-utils";
import * as awilix from "awilix";
import { asValue } from "awilix";
import { strictEqual } from "assert";
import { UserAttributeAddedEvent } from "../../app/features/users/subscribers/events/user-attribute-added.event";

const [userWithAdminPanelAttr] = usersFixture;

describe("add-attribute.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();

    const { container } = GLOBAL.bootstrap;
    container.register(
      "userActivationConfig",
      asValue({ isUserActivationNeeded: false, timeToActiveAccountInDays: 3 }),
    );
  });

  it("Should add attributes for a user and verify if attributes exist.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const newUsername = v4();
    const attributes = ["attr1", "attr2"];

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(StatusCodes.CREATED);

    const { newUserId: userId } = addUserResponse.body;

    await request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes })
      .expect(StatusCodes.CREATED);

    const { accessToken: newUserAccessToken } = await authClient.login(newUsername, "randomPassword");

    return request(app)
      .post("/api/users/has-attributes")
      .set("Authorization", `Bearer ${newUserAccessToken}`)
      .send({ attributes: [...attributes] })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.OK, UsersResponses.hasAttributeResponseFactory());
  });

  it("Should return BAD_REQUEST if empty array of attributes.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const newUsername = v4();

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(StatusCodes.CREATED);

    const { newUserId: userId } = addUserResponse.body;

    return request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes: [] })
      .expect(StatusCodes.BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"attributes" does not contain 1 required value(s)');
      });
  });

  it("Should return BAD_REQUEST if attributes not array.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const newUsername = v4();

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(StatusCodes.CREATED);

    const { newUserId: userId } = addUserResponse.body;

    return request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes: "WrongValueForAttributes" })
      .expect(StatusCodes.BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"attributes" must be an array');
      });
  });

  it("Should return BAD_REQUEST if attributes not array.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const newUsername = v4();

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(StatusCodes.CREATED);

    const { newUserId: userId } = addUserResponse.body;

    return request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes: "WrongValueForAttributes" })
      .expect(StatusCodes.BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"attributes" must be an array');
      });
  });

  it("Should return BAD_REQUEST if userId is missing.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const attributes = ["attr1", "attr2"];

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ attributes })
      .expect(StatusCodes.BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"userId" is required');
      });
  });

  it("Should return BAD_REQUEST if userId is not guid.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const attributes = ["attr1", "attr2"];

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId: "wrongUserId", attributes })
      .expect(StatusCodes.BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"userId" must be a valid GUID');
      });
  });

  it("Should return NOT_FOUND if try to add attributes for user that not exist.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const attributes = ["attr1", "attr2"];

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId: "11111111-1111-1111-1111-111111111111", attributes })
      .expect(StatusCodes.NOT_FOUND)
      .expect(deepEqualOmit(BadRequestResponses.userWithIdNotExistFactory("11111111-1111-1111-1111-111111111111")));
  });

  it("Should return error when adding attribute which was already added.", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const newUsername = v4();
    const attributes = ["attr1", "attr2"];

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(StatusCodes.CREATED);

    const { newUserId: userId } = addUserResponse.body;

    await request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes })
      .expect(StatusCodes.CREATED);

    return request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId, attributes })
      .expect(StatusCodes.CONFLICT)
      .expect(deepEqualOmit(BadRequestResponses.userHasAttributesConflictErrorFactory(attributes)));
  });

  it("Should trigger UserAttributeAdded", async () => {
    let triggeredEvent: UserAttributeAddedEvent = { name: "Event", payload: { userId: "", attributes: [] } };
    GLOBAL.bootstrap.container.register({
      httpEventHandler: awilix.asFunction(() => (event: UserAttributeAddedEvent) => {
        triggeredEvent = event;
      }),
    });
    const { authClient, app } = GLOBAL.bootstrap;
    const newUsername = v4();
    const attributes = ["attr1", "attr2"];
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: newUsername, password: "randomPassword" })
      .expect(StatusCodes.CREATED);

    await request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId: response.body.newUserId, attributes })
      .expect(StatusCodes.CREATED);

    // eslint-disable-next-line no-console
    console.log(triggeredEvent);
    strictEqual(triggeredEvent?.name, "UserAttributeAddedEvent");
    strictEqual(triggeredEvent?.payload.userId, response.body.newUserId);
    strictEqual(triggeredEvent?.payload.attributes[0].name, attributes[0]);
    strictEqual(triggeredEvent?.payload.attributes[1].name, attributes[1]);
  });

  after(() => {
    const { container } = GLOBAL.bootstrap;
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));
  });
});

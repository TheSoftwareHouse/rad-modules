import { UNAUTHORIZED, CREATED, CONFLICT, NO_CONTENT } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit } from "../../../../../shared/test-utils";
import { GlobalData } from "../bootstrap";
import { Event } from "../../shared/event-dispatcher";
import * as awilix from "awilix";
import { deepStrictEqual } from "assert";

const [userWithAdminPanelAttr, normalUser] = usersFixture;

describe("delete-user.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should delete user if user has correct attribute", async () => {
    const { authClient, usersRepository, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "userToDelete", password: "1234567qaz" })
      .expect(CREATED);

    const { newUserId } = addUserResponse.body;
    let userToDelete = await usersRepository.findById(newUserId);

    assert(userToDelete !== undefined);

    await request(app)
      .delete(`/api/users/delete-user?userId=${newUserId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(NO_CONTENT);

    userToDelete = await usersRepository.findById(newUserId);

    assert(userToDelete === undefined);
  });

  it("Should returns Unauthorized if user has no correct attribute and try to delete other user", async () => {
    const { authClient, usersRepository, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "userToDelete2", password: "1234567qaz" })
      .expect(CREATED);

    const { newUserId } = addUserResponse.body;
    const userToDelete = await usersRepository.findById(newUserId);

    assert(userToDelete !== undefined);

    const { accessToken: accessTokenWrongAttribute } = await authClient.login(normalUser.username, normalUser.password);

    return request(app)
      .delete(`/api/users/delete-user?userId=${newUserId}`)
      .set("Authorization", `Bearer ${accessTokenWrongAttribute}`)
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.userHasNoAccess));
  });

  it("Should return conflict error when try to delete the system administration account", async () => {
    const { authClient, superAdminUser, usersRepository, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);
    const user = await usersRepository.findByUsername(superAdminUser.username);

    if (!user) {
      throw new Error("User not found");
    }

    return request(app)
      .delete(`/api/users/delete-user?userId=${user.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CONFLICT)
      .expect(deepEqualOmit(BadRequestResponses.adminDelete));
  });

  it("Should trigger UserRemoved", async () => {
    let triggeredEvent: Event = { name: "Event", payload: {} };
    GLOBAL.bootstrap.container.register({
      httpEventHandler: awilix.asFunction(() => (event: Event) => {
        triggeredEvent = event;
      }),
    });
    const { authClient, usersRepository, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "userToDelete", password: "1234567qaz" })
      .expect(CREATED);
    const { newUserId } = addUserResponse.body;
    const userToDelete = await usersRepository.findById(newUserId);
    await request(app)
      .delete(`/api/users/delete-user?userId=${newUserId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(NO_CONTENT);

    deepStrictEqual(triggeredEvent, {
      name: "UserRemoved",
      payload: {
        userId: userToDelete!.id,
        attributes: [],
      },
    });
  });
});

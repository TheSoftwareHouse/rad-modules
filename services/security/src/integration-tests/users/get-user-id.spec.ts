import { UNAUTHORIZED, OK, BAD_REQUEST, NOT_FOUND } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit, isNotEmptyString, isUuid } from "../test-utils";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr, normalUser] = usersFixture;

describe("get-user-id.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should returns Unauthorized if user has no access to checking user id by username", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(normalUser.username, normalUser.password);

    return request(app)
      .get("/api/users/get-user-id?username=user1")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.userHasNoAccess));
  });

  it("Should returns bad request if no username in query", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/users/get-user-id")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit({ error: '"username" is required' }));
  });

  it("Should returns Not found if no user with given username", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/users/get-user-id?username=NotExistingUser")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(NOT_FOUND)
      .expect(deepEqualOmit(BadRequestResponses.userNotFound));
  });

  it("Should returns userId if user has right access", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .get("/api/users/get-user-id?username=user2")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(OK);

    const { userId } = response.body;

    assert(isNotEmptyString(userId));
    assert(isUuid(userId));
  });

  it("Should return array of two users if filter contains two existing usersIds in query parameter", async () => {
    const { authClient, superAdminUser, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const user1IdResponse = await request(app)
      .get("/api/users/get-user-id?username=user1")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { userId: user1Id } = user1IdResponse.body;

    const user2IdResponse = await request(app)
      .get("/api/users/get-user-id?username=superadmin")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { userId: user2Id } = user2IdResponse.body;

    const usersResponse = await request(app)
      .get(`/api/users?filter[id][eq]=${user1Id}&filter[id][eqOr]=${user2Id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(OK);

    const { users }: { users: any[] } = usersResponse.body;

    assert.strictEqual(users.length, 2);
  });
});

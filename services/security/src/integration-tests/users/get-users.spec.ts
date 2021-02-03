import { OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { GlobalData } from "../bootstrap";
import { isUuid, isNotEmptyString } from "../../../../../shared/test-utils";

const [userWithAdminPanelAttr] = usersFixture;

describe("get-users.action", () => {
  const DEFAULT_LIMIT = 25;
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return max 25 users records if query params not set", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const usersResponse = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { users } = usersResponse.body;

    assert(Array.isArray(users));
    assert(users.length > 0);
    assert(users.length <= DEFAULT_LIMIT);
    assert(users.every((user: any) => isUuid(user.id) && isNotEmptyString(user.username)));
  });

  it("Should return users records with specific attribute", async () => {
    const attributeName = "ROLE_SUPERADMIN";
    const { authClient, superAdminUser, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const usersResponse = await request(app)
      .get(`/api/users?filter[attribute.name][eq]=${attributeName}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { users }: { users: any[] } = usersResponse.body;

    assert(users.length === 1 && users.every((user) => user.attributes.includes(attributeName)));
  });

  it("Should return empty array of users if attribute doesn't exist", async () => {
    const { authClient, superAdminUser, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);

    const usersResponse = await request(app)
      .get("/api/users?filter[attribute.name][eq]=WrongAttribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { users }: { users: any[] } = usersResponse.body;

    assert.strictEqual(users.length, 0);
  });
});

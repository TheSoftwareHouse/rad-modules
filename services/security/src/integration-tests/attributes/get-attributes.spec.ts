import { OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr] = usersFixture;

describe("get-attributes.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return attributes records", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const usersResponse = await request(app)
      .get("/api/attributes")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const bodyKeys = Object.keys(usersResponse.body);
    const { attributes } = usersResponse.body;

    assert.deepStrictEqual(bodyKeys, ["attributes", "total", "page", "limit"]);

    assert(Array.isArray(attributes));
    assert(attributes.length > 0);

    attributes.forEach((attribute: any) => {
      const objectKeys = Object.keys(attribute);
      assert.deepStrictEqual(objectKeys, ["id", "name", "userId", "username"]);
    });
  });
});

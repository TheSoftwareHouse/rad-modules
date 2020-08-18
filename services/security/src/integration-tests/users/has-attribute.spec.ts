import { OK, CREATED } from "http-status-codes";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";
import { usersFixture, adminPanelAttributeName } from "../fixtures/users.fixture";
import { appConfig } from "../../config/config";

const [userWithAdminPanelAttr, normalUser, superAdminUser] = usersFixture; // eslint-disable-line

describe("has-attribute.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return valid response if user has attribute", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const attributeName = adminPanelAttributeName;

    return request(app)
      .post("/api/users/has-attributes")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ attributes: [attributeName] })
      .expect("Content-Type", /json/)
      .expect(OK, {
        hasAllAttributes: true,
      });
  });

  it("Should return response with hasAllAttributes:true and all attributes from query parameter in ownedAttributes array when x-api-key in header", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(superAdminUser.username, superAdminUser.password);
    const attributeName = "ROLE_SUPERADMIN";

    const { body } = await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { apiKey } = body;

    return request(app)
      .post("/api/users/has-attributes")
      .set(appConfig.apiKeyHeaderName, apiKey)
      .send({ attributes: [attributeName] })
      .expect("Content-Type", /json/)
      .expect(OK, { hasAllAttributes: true, ownedAttributes: [attributeName] });
  });
});

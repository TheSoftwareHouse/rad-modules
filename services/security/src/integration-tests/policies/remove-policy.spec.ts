import * as request from "supertest";
import * as querystring from "querystring";
import { CREATED, CONFLICT, NO_CONTENT } from "http-status-codes";
import { appConfig } from "../../config/config";
import { usersFixture } from "../fixtures/users.fixture";
import { deepEqualOmit } from "../../../../../shared/test-utils";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr] = usersFixture;

describe("Remove policy test", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return no-content status after policy removed", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const resource = "resource_to_remove";
    const attribute = "attribute_to_remove";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource, attribute })
      .expect(CREATED);

    const query = querystring.encode({
      resource,
      attribute,
    });

    return request(app)
      .delete(`/api/policy/remove-policy?${query}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(NO_CONTENT);
  });

  it("Should return conflict status if user try to delete base policy", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const query = querystring.encode({
      resource: appConfig.adminPanelPolicies.addUser.resource,
      attribute: appConfig.adminPanelPolicies.addUser.attribute,
    });

    return request(app)
      .delete(`/api/policy/remove-policy?${query}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CONFLICT)
      .expect(deepEqualOmit(BadRequestResponses.policyCannotDelete));
  });
});

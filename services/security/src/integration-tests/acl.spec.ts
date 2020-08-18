import * as assert from "assert";
import * as request from "supertest";
import { OK, UNAUTHORIZED, CREATED, NO_CONTENT, CONFLICT } from "http-status-codes";
import { usersFixture } from "./fixtures/users.fixture";
import { TEST_ATTRIBUTE_NAME, TEST_RESOURCE_VALUE } from "./fixtures/policies.fixture";
import { AclResponses, BadRequestResponses } from "./fixtures/response.fixture";
import { deepEqualOmit } from "../../../../shared/test-utils";
import { GlobalData } from "./bootstrap";

const [userWithAdminPanelAttr] = usersFixture;

describe("Acl tests", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return false when user has no access to a resource", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const usernameToCheck1 = "usernameToCheckAccess1";
    const password1 = "Password1234";
    const newAttribute = "newAttribute";
    const newResource = "newResource";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const { status } = await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource: newResource, attribute: newAttribute })
      .expect("Content-Type", /json/);

    assert(status === CREATED || status === CONFLICT);

    await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: usernameToCheck1, password: password1 })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { accessToken: userToCheckAccessToken } = await authClient.login(usernameToCheck1, password1);

    await request(app)
      .post("/api/users/has-access")
      .set("Authorization", `Bearer ${userToCheckAccessToken}`)
      .send({ resources: [newResource] })
      .expect("Content-Type", /json/)
      .expect(OK, AclResponses.hasNotAccess);
  });

  it("Should return true when user has access to a resource", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const usernameToCheck2 = "usernameToCheckAccess2";
    const password2 = "Password1234";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const addUserResponse = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: usernameToCheck2, password: password2 })
      .expect(CREATED);

    const { newUserId } = addUserResponse.body;

    await request(app)
      .post("/api/users/add-attribute")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ userId: newUserId, attributes: [TEST_ATTRIBUTE_NAME] });

    const { accessToken: userToCheckAccessToken } = await authClient.login(usernameToCheck2, password2);

    await request(app)
      .post("/api/users/has-access")
      .set("Authorization", `Bearer ${userToCheckAccessToken}`)
      .send({ resources: [TEST_RESOURCE_VALUE] })
      .expect("Content-Type", /json/)
      .expect(OK, AclResponses.hasAccess);

    return request(app)
      .post("/api/users/has-access")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resources: ["user-operation/add-user", "user-operation/edit-user", "user-operation/reset-password"] })
      .expect("Content-Type", /json/)
      .expect(OK, AclResponses.hasAccess);
  });

  it("Should return 401 (UNAUTHORIZED) when invalid token is provided", async () => {
    const { app } = GLOBAL.bootstrap;

    return request(app)
      .post("/api/users/has-access")
      .set("Authorization", "Bearer invalid_token")
      .send({ resources: [TEST_RESOURCE_VALUE] })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.tokenFailedToVerify));
  });

  it("Should return 401 (UNAUTHORIZED) when no token is provided", async () => {
    const { app } = GLOBAL.bootstrap;

    return request(app)
      .post("/api/users/has-access?resource")
      .send({ resources: [TEST_RESOURCE_VALUE] })
      .expect("Content-Type", /json/)
      .expect(UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.tokenMissingOrInvalid));
  });

  it("Should remove policy by resource and attribute", async () => {
    const { authClient, policyRepository, app } = GLOBAL.bootstrap;
    const newAttribute = "NEW_ATTRIBUTE_TEST";
    const newResource = "new/resource/test";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource: newResource, attribute: newAttribute })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    await request(app)
      .delete(`/api/policy/remove-policy?resource=${newResource}&attribute=${newAttribute}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(NO_CONTENT);

    const policies = await policyRepository.findBy({ resource: newResource, attribute: newAttribute });

    assert.strictEqual(policies.length, 0);
  });
});

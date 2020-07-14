import * as request from "supertest";
import * as querystring from "querystring";
import { OK, CREATED, CONFLICT, BAD_REQUEST } from "http-status-codes";
import * as assert from "assert";
import { appConfig } from "../../config/config";
import { usersFixture } from "../fixtures/users.fixture";
import { deepEqualOmit, isUuid, isNotEmptyString } from "../test-utils";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr] = usersFixture;

describe("Policy test", () => {
  const DEFAULT_LIMIT = 25;
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return created status after new policy creation", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const resource = "new_resource";
    const attribute = "new_attribute";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const { body, status } = await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource, attribute })
      .expect("Content-Type", /json/);

    assert(status === CREATED || status === CONFLICT);
    if (status === CREATED) {
      assert(isNotEmptyString(body?.id));
      assert(isUuid(body?.id));
    }
  });

  it("Should return conflict status if user try to add policy that already exists", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const resource = "test_resource";
    const attribute = "test_attribute";
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const { status } = await request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource, attribute })
      .expect("Content-Type", /json/);

    assert(status === CREATED || status === CONFLICT);

    return request(app)
      .post("/api/policy/add-policy")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ resource, attribute })
      .expect("Content-Type", /json/)
      .expect(CONFLICT)
      .expect(deepEqualOmit(BadRequestResponses.policyAlreadyExists));
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

  it("Should return bad request if wrong query parameters", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/policy/get-policies?page=badPage&limit=badLimit")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit({ error: '"page" must be a number. "limit" must be a number' }));
  });

  it("Should return bad request if empty query parameters", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/policy/get-policies?page=&limit=")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit({ error: '"page" must be a number. "limit" must be a number' }));
  });

  it("Should return bad request if page is float point number", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/policy/get-policies?page=1.5")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit({ error: '"page" must be an integer' }));
  });

  it("Should return max 10 policies records if limit parameter set to 10", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const policiesResponse = await request(app)
      .get("/api/policy/get-policies?limit=10")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { policies } = policiesResponse.body;

    assert(Array.isArray(policies));
    assert(policies.length <= 10);
    assert(
      policies.every(
        (policy: any) =>
          (isUuid(policy.id) ||
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-[\s\S]{1,}$/.test(
              policy.id,
            )) &&
          isNotEmptyString(policy.resource),
      ),
    );
  });

  it("Should return max 25 policies records if query not set", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const policiesResponse = await request(app)
      .get("/api/policy/get-policies")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { policies } = policiesResponse.body;

    assert(Array.isArray(policies));
    assert(policies.length <= DEFAULT_LIMIT);
    assert(
      policies.every(
        (policy: any) =>
          (isUuid(policy.id) ||
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-[\s\S]{1,}$/.test(
              policy.id,
            )) &&
          isNotEmptyString(policy.attribute) &&
          isNotEmptyString(policy.resource),
      ),
    );
  });

  it("Should return policies data even if any extra query parameter added", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const policiesResponse = await request(app)
      .get("/api/policy/get-policies?extraQueryItem=test")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { policies } = policiesResponse.body;

    assert(Array.isArray(policies));
    assert(policies.length <= DEFAULT_LIMIT);
    assert(
      policies.every(
        (policy: any) =>
          (isUuid(policy.id) ||
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-[\s\S]{1,}$/.test(
              policy.id,
            )) &&
          isNotEmptyString(policy.attribute) &&
          isNotEmptyString(policy.resource),
      ),
    );
  });

  it("Should return policies data for query and don't matter about case sensitive", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);
    const policiesResponse = await request(app)
      .get("/api/policy/get-policies?filter[resource][includeOr]=AtT")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { policies } = policiesResponse.body;
    const regexp = /att/;
    const result = policies.map((policy: any) => regexp.test(policy.resource));

    assert(Array.isArray(policies));
    assert(result.reduce((a: boolean, v: boolean) => a && v));
    assert(policies.length <= DEFAULT_LIMIT);
    assert(
      policies.every(
        (policy: any) =>
          (isUuid(policy.id) ||
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}-[\s\S]{1,}$/.test(
              policy.id,
            )) &&
          isNotEmptyString(policy.attribute) &&
          isNotEmptyString(policy.resource),
      ),
    );
  });
});

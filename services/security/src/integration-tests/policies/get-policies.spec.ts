import * as request from "supertest";
import { OK, BAD_REQUEST } from "http-status-codes";
import * as assert from "assert";
import { usersFixture } from "../fixtures/users.fixture";
import { isUuid, isNotEmptyString } from "../../../../../shared/test-utils";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr] = usersFixture;

describe("Get policies test", () => {
  const DEFAULT_LIMIT = 25;
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return bad request if wrong query parameters", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/policy/get-policies?page=badPage&limit=badLimit")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"page" must be a number');
        assert.strictEqual(response.body.error.details[1].message, '"limit" must be a number');
      });
  });

  it("Should return bad request if empty query parameters", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/policy/get-policies?page=&limit=")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"page" must be a number');
        assert.strictEqual(response.body.error.details[1].message, '"limit" must be a number');
      });
  });

  it("Should return bad request if page is float point number", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    return request(app)
      .get("/api/policy/get-policies?page=1.5")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"page" must be an integer');
      });
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

import { CREATED, OK, BAD_REQUEST } from "http-status-codes";
import * as request from "supertest";
import * as assert from "assert";
import { isUuid, isValidTokenType, isNotEmptyString } from "../../../../../shared/test-utils";
import { GlobalData } from "../bootstrap";
import { appConfig } from "../../config/config";

describe("Access API key tests", () => {
  const GLOBAL = {} as GlobalData;
  const username = "superadmin";
  const password = "superadmin";
  const DEFAULT_LIMIT = 25;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return bad request if wrong query parameters", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    await request(app)
      .get("/api/tokens/get-access-keys?page=badPage&limit=badLimit")
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
    const { accessToken } = await authClient.login(username, password);

    await request(app)
      .get("/api/tokens/get-access-keys?page=&limit=")
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
    const { accessToken } = await authClient.login(username, password);

    await request(app)
      .get("/api/tokens/get-access-keys?page=1.5")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect((response: any) => {
        assert.strictEqual(response.body.error.details[0].message, '"page" must be an integer');
      });
  });

  it("Should return max 10 access keys records if limit parameter set to 10", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const accessKeysResponse = await request(app)
      .get("/api/tokens/get-access-keys?limit=10")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { accessKeys }: { accessKeys: any[] } = accessKeysResponse.body;

    assert(Array.isArray(accessKeys));
    assert(accessKeys.length <= 10);
    assert(
      accessKeys.every(
        (key: any) => isUuid(key.apiKey) && isValidTokenType(key.type) && isNotEmptyString(key.createdBy),
      ),
    );
  });

  it("Should return max 25 access keys records if query not set", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const accessKeysResponse = await request(app)
      .get("/api/tokens/get-access-keys")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { accessKeys } = accessKeysResponse.body;

    assert(Array.isArray(accessKeys));
    assert(accessKeys.length <= DEFAULT_LIMIT);
    assert(
      accessKeys.every(
        (key: any) => isUuid(key.apiKey) && isValidTokenType(key.type) && isNotEmptyString(key.createdBy),
      ),
    );
  });

  it("Should return access keys data even if any extra query parameter added", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const accessKeysResponse = await request(app)
      .get("/api/tokens/get-access-keys?extraQueryItem=test")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK);

    const { accessKeys } = accessKeysResponse.body;

    assert(Array.isArray(accessKeys));
    assert(accessKeys.length <= DEFAULT_LIMIT);
    assert(
      accessKeys.every(
        (key: any) => isUuid(key.apiKey) && isValidTokenType(key.type) && isNotEmptyString(key.createdBy),
      ),
    );
  });

  it("Should allow use secure endpoints with access key", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    const { body } = await request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED);

    const { apiKey } = body;

    const { body: addUserBody } = await request(app)
      .post("/api/users/add-user")
      .set(appConfig.apiKeyHeaderName, apiKey)
      .send({ username: "NewInActiveUser", password: "randomPassword" })
      .expect("Content-Type", /json/)
      .expect(CREATED);

    assert(isNotEmptyString(addUserBody.newUserId) && isUuid(addUserBody.newUserId));
  });
});

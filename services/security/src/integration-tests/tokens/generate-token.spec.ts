import { CREATED, OK } from "http-status-codes";
import * as request from "supertest";
import * as assert from "assert";
import { appConfig } from "../../config/config";
import { GlobalData } from "../bootstrap";

describe("Custom tokens tests", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should create new custom token", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const tokenPayload = {
      accessExpirationInSeconds: 20,
      refreshExpirationInSeconds: 10,
    };
    const { accessToken } = await authClient.login("superadmin", "superadmin");

    return request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(CREATED)
      .then((data) => {
        const apiKey = data.body?.apiKey;
        if (apiKey.match(/^[a-z0-9\\-]{36}$/) === null) {
          assert.fail();
        }
        return request(app)
          .post("/api/tokens/generate-token")
          .set(appConfig.apiKeyHeaderName, apiKey)
          .send(tokenPayload)
          .expect(OK)
          .then((response) =>
            request(app)
              .get("/api/users/has-access")
              .set("Authorization", `Bearer ${response.body.accessToken}`)
              .send({ resources: ["attr1"] })
              .expect(OK),
          )
          .then(() =>
            request(app)
              .post("/api/tokens/generate-token")
              .set(appConfig.apiKeyHeaderName, apiKey)
              .send(tokenPayload)
              .expect(OK)
              .then((response) =>
                request(app)
                  .get("/api/users/has-access?resource=attr2")
                  .set("Authorization", `Bearer ${response.body.accessToken}`)
                  .send({ resources: ["attr2"] })
                  .expect(OK)
                  .then((result) => assert.equal(result.body.hasAccess, false)),
              ),
          )
          .then(() =>
            request(app)
              .post("/api/tokens/generate-token")
              .set(appConfig.apiKeyHeaderName, apiKey)
              .send(tokenPayload)
              .expect(OK)
              .then((response) =>
                request(app)
                  .get("/api/users/has-attribute?attributes=ADMIN_PANEL,attr2")
                  .set("Authorization", `Bearer ${response.body.accessToken}`)
                  .expect(OK)
                  .then((result) =>
                    assert.deepStrictEqual(result.body, { hasAllAttributes: false, ownedAttributes: ["ADMIN_PANEL"] }),
                  ),
              ),
          );
      });
  });
});

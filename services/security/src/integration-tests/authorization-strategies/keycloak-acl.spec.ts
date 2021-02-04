// import { OK, INTERNAL_SERVER_ERROR } from "http-status-codes";
// import * as request from "supertest";
// import * as assert from "assert";
import { GlobalData } from "../bootstrap";
// import { KeycloakAuthorizationClient } from "../../ACL/keycloak/keycloak-authorization-client";
// import { HttpError } from "../../errors/http.error";

describe("Keycloak authorization client tests (ACL test)", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  // const username = "user";
  // const password = "user";

  // describe("isSuperAdmin test", () => {
  //   it("Should throw error", async () => {
  //     const { app, container } = GLOBAL.bootstrap;
  //     const result = await request(app)
  //       .post("/api/users/login")
  //       .send({ username, password })
  //       .expect(OK)
  //       .expect("Content-Type", /application\/json/);
  //     const { accessToken } = result.body;
  //     const keycloakAuthorizationClient: KeycloakAuthorizationClient = container.resolve("authorizationClient");
  //
  //     return keycloakAuthorizationClient
  //       .isSuperAdmin(accessToken)
  //       .then(() => assert.fail("fail"))
  //       .catch((error) => assert.deepStrictEqual(error, new HttpError("not implemented", INTERNAL_SERVER_ERROR)));
  //   });
  // });
  //
  // describe("hasAccess test", () => {
  //   it("Should throw error", async () => {
  //     const { app, container } = GLOBAL.bootstrap;
  //     const result = await request(app).post("/api/users/login").send({ username, password }).expect(OK);
  //     const { accessToken } = result.body;
  //     const keycloakAuthorizationClient: KeycloakAuthorizationClient = container.resolve("authorizationClient");
  //
  //     return keycloakAuthorizationClient
  //       .hasAccess(accessToken, "resource")
  //       .then(() => assert.fail("fail"))
  //       .catch((error) => assert.deepStrictEqual(error, new HttpError("not implemented", INTERNAL_SERVER_ERROR)));
  //   });
  // });
  //
  // describe("hasAttribute test", () => {
  //   it("Should throw error", async () => {
  //     const { app, container } = GLOBAL.bootstrap;
  //     const result = await request(app).post("/api/users/login").send({ username, password }).expect(OK);
  //     const { accessToken } = result.body;
  //     const keycloakAuthorizationClient: KeycloakAuthorizationClient = container.resolve("authorizationClient");
  //
  //     return keycloakAuthorizationClient
  //       .hasAttributes(accessToken, [])
  //       .then(() => assert.fail("fail"))
  //       .catch((error) => assert.deepStrictEqual(error, new HttpError("not implemented", INTERNAL_SERVER_ERROR)));
  //   });
  // });
});

// import { UNAUTHORIZED, OK } from "http-status-codes";
// import * as request from "supertest";
import { GlobalData } from "../bootstrap";
// import * as assert from "assert";
// import { decode } from "jsonwebtoken";
// import { deepEqualOmit } from "../test-utils";

describe("Keycloak authentication client tests", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  // const username = "user";
  // const password = "user";
  // const badPassword = "bad user password";

  // it("Should authenticate a user with correct credentials", async () => {
  //   const { app } = GLOBAL.bootstrap;
  //   const result = await request(app)
  //     .post("/api/users/login")
  //     .send({ username, password })
  //     .expect("Content-Type", /application\/json/)
  //     .expect(OK);
  //   assert.deepStrictEqual(["accessToken", "refreshToken"], Object.keys(result.body));
  //   const { accessToken, refreshToken } = result.body;
  //   assert(decode(accessToken));
  //   assert(decode(refreshToken));
  // });
  //
  // it("Should not authenticate a user with incorrect credentials", () => {
  //   const { app } = GLOBAL.bootstrap;
  //   return request(app)
  //     .post("/api/users/login")
  //     .send({ username, password: badPassword })
  //     .expect("Content-Type", /application\/json/)
  //     .expect(UNAUTHORIZED)
  //     .expect(deepEqualOmit({ error: "invalid_grant" }));
  // });
});

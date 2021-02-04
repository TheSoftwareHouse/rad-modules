import { StatusCodes } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit } from "../../../../../shared/test-utils";
import { decode } from "jsonwebtoken";
import { GlobalData } from "../bootstrap";

const normalUser = usersFixture[1];

describe("public login.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Login endpoint should return accessToken and refreshToken", async () => {
    const { app } = GLOBAL.bootstrap;
    const { body } = await request(app)
      .post("/api/public/auth/login")
      .send({ username: normalUser.username, password: normalUser.password })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.OK);

    assert(decode(body.accessToken));
    assert(decode(body.refreshToken));
  });

  it("Should not authenticate a user with incorrect credentials", () => {
    const { app } = GLOBAL.bootstrap;
    return request(app)
      .post("/api/public/auth/login")
      .send({ username: normalUser.username, password: "wrong password" })
      .expect("Content-Type", /json/)
      .expect(StatusCodes.UNAUTHORIZED)
      .expect(deepEqualOmit(BadRequestResponses.wrongUsernameOrPassword));
  });
});

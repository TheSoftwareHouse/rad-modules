import { OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { usersFixture } from "../fixtures/users.fixture";
import { GlobalData } from "../bootstrap";

const normalUser = usersFixture.find((user) => user.username === "superadmin");

describe("public me.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should get 'me' object", async () => {
    const { app } = GLOBAL.bootstrap;
    const {
      body: { accessToken },
    } = await request(app)
      .post("/api/public/auth/login")
      .send({ username: normalUser!.username, password: normalUser!.password })
      .expect("Content-Type", /json/)
      .expect(OK);

    return request(app)
      .get("/api/public/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK)
      .expect((result: any) => {
        assert.deepStrictEqual(Object.keys(result.body ?? []), [
          "id",
          "username",
          "email",
          "isActive",
          "attributes",
          "resources",
        ]);
      });
  });
});

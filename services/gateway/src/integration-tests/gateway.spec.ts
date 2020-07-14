import { v4 } from "uuid";
import { CREATED, FORBIDDEN, OK } from "http-status-codes";
import * as request from "supertest";

import { Application } from "../app/application.types";

describe("Gateway tests", () => {
  let app: Application;
  let container: any;
  before(async () => {
    const { container: globalContainer } = global as any;
    container = globalContainer;
    app = container.resolve("app");
  });
  const username = v4();
  const password = "password";

  it("Should check proxy.json routing", async () => {
    const loginSuperadminResponse = await request(app)
      .post("/api/login")
      .send({ username: "superadmin", password: "superadmin" })
      .expect(OK);

    await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${loginSuperadminResponse.body.accessToken}`)
      .send({ username, password })
      .expect(CREATED);

    const loginUserResponse = await request(app).post("/api/login").send({ username, password }).expect(OK);

    return request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${loginUserResponse.body.accessToken}`)
      .expect(FORBIDDEN, { error: "User has no access" });
  });
});

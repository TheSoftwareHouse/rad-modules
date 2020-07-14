import * as request from "supertest";
import { OK, BAD_REQUEST, NOT_FOUND } from "http-status-codes";
import * as assert from "assert";
import { v4 } from "uuid";
import { usersFixture } from "../fixtures/users.fixture";
import { BadRequestResponses } from "../fixtures/response.fixture";
import { deepEqualOmit } from "../test-utils";
import { GlobalData } from "../bootstrap";

const [userWithAdminPanelAttr, normalUser] = usersFixture;

describe("Get user test", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should return 400 if bad request", async () => {
    const { app } = GLOBAL.bootstrap;
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: userWithAdminPanelAttr.username, password: userWithAdminPanelAttr.password })
      .expect("Content-Type", /json/)
      .expect(OK);

    const { accessToken } = loginResponse.body;

    await request(app)
      .get("/api/users/get-user/IT_IS_NOT_USER_ID")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(BAD_REQUEST)
      .expect(deepEqualOmit({ error: '"userId" must be a valid GUID' }));
  });

  it("Should return 404 if user not found", async () => {
    const { app } = GLOBAL.bootstrap;
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: userWithAdminPanelAttr.username, password: userWithAdminPanelAttr.password })
      .expect("Content-Type", /json/)
      .expect(OK);

    const { accessToken } = loginResponse.body;

    return request(app)
      .get(`/api/users/get-user/${v4()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(NOT_FOUND)
      .expect(deepEqualOmit(BadRequestResponses.userNotFound));
  });

  it("Should return user object", async () => {
    const { usersRepository, app } = GLOBAL.bootstrap;
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: userWithAdminPanelAttr.username, password: userWithAdminPanelAttr.password })
      .expect(OK);

    const { accessToken } = loginResponse.body;
    const user = await usersRepository.findByUsername(normalUser.username);

    await request(app)
      .get(`/api/users/get-user/${user?.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(OK)
      .then((data) =>
        assert.deepStrictEqual(
          { ...data.body, createdAt: undefined, updatedAt: undefined },
          {
            id: user?.id,
            username: user?.username,
            isActive: true,
            activationToken: null,
            attributes: [],
            createdAt: undefined,
            updatedAt: undefined,
            isSuperAdmin: false,
          },
        ),
      );
  });
});

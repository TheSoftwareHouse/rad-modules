import { CREATED, OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { asValue } from "awilix";
import { usersFixture } from "../fixtures/users.fixture";
import { GlobalData } from "../bootstrap";
import { isDate, isNotEmptyString, isUuid } from "../test-utils";

const [userWithAdminPanelAttr] = usersFixture;

describe("deactivate-user.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should deactivate user", async () => {
    const { authClient, container, usersRepository, app } = GLOBAL.bootstrap;
    const userActivationConfigOriginal = container.resolve("userActivationConfig");
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));

    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: true });

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "NewUserToDeactivate", password: "randomPassword" })
      .expect(CREATED);

    const { newUserId } = response.body;
    let user = await usersRepository.findById(newUserId);

    if (user) {
      const { activationToken } = user;
      await request(app).post(`/api/users/activate-user/${activationToken}`).expect(OK);

      const { body } = await request(app)
        .post("/api/users/deactivate-user")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userId: newUserId })
        .expect(OK);

      assert(isNotEmptyString(body.userId));
      assert(isUuid(body.userId));
      assert(typeof body.isActive === "boolean");
      assert(body.isActive === false);
      assert(isNotEmptyString(body.deactivationDate));

      user = await usersRepository.findById(newUserId);
      assert(user?.isActive === false);
      assert(isDate(user?.deactivationDate));
    }

    container.register("userActivationConfig", asValue(userActivationConfigOriginal));
  });
});

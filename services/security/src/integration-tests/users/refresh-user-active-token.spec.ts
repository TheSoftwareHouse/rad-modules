import { StatusCodes } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { asValue } from "awilix";
import { usersFixture } from "../fixtures/users.fixture";
import { GlobalData } from "../bootstrap";
import { isNotEmptyString } from "../../../../../shared/test-utils";

const [userWithAdminPanelAttr] = usersFixture;

describe("refresh-user-active-token.action", () => {
  const GLOBAL = {} as GlobalData;

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should refresh activation token for the user", async () => {
    const { authClient, container, usersRepository, app } = GLOBAL.bootstrap;
    const userActivationConfigOriginal = container.resolve("userActivationConfig");
    container.register("userActivationConfig", asValue({ isUserActivationNeeded: true, timeToActiveAccountInDays: 3 }));

    await usersRepository.update({ username: userWithAdminPanelAttr.username }, { isActive: true });

    const { accessToken } = await authClient.login(userWithAdminPanelAttr.username, userWithAdminPanelAttr.password);

    const response = await request(app)
      .post("/api/users/add-user")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ username: "UserToRefreshToken", password: "randomPassword" })
      .expect(StatusCodes.CREATED);

    const { newUserId } = response.body;
    const user = await usersRepository.findById(newUserId);

    if (user) {
      const { activationToken: oldToken } = user;
      const refreshEndpointResponse = await request(app)
        .post("/api/users/refresh-user-active-token")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ userId: newUserId })
        .expect(StatusCodes.OK);

      const { body } = refreshEndpointResponse;
      assert(isNotEmptyString(body.activationToken));

      const { activationToken: newToken } = body;
      assert(oldToken !== newToken);
    }

    container.register("userActivationConfig", asValue(userActivationConfigOriginal));
  });
});

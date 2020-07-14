import { OK } from "http-status-codes";
import * as assert from "assert";
import * as request from "supertest";
import { asValue, asClass } from "awilix";
import { GlobalData } from "../bootstrap";

describe("oauth-redirect.action", () => {
  const GLOBAL = {} as GlobalData;
  let googleClientOriginal: any;
  const testOauthUserEmail = "testOauthUser@tsh.com";

  before(() => {
    class TestOAuthClient {
      login(_code: string, _redirectUrl: string): Promise<{ email: string }> {
        return Promise.resolve({ email: testOauthUserEmail });
      }
    }
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
    const { container } = GLOBAL.bootstrap;

    googleClientOriginal = container.resolve("googleClient");
    container.register("googleClient", asClass(TestOAuthClient));
  });

  it("Should add default attributes (if provided in config) for oauth user", async () => {
    const { usersRepository, app } = GLOBAL.bootstrap;

    await request(app).get("/api/users/oauth-redirect?code=1234&redirectUrl=http://exampleRedirectUrl.xd").expect(OK);

    const testUser = await usersRepository.findByUsername(testOauthUserEmail);

    assert(testUser?.attributes.some((attribute) => attribute.name === "OAUTH_USER"));
  });

  after(() => {
    const { container } = GLOBAL.bootstrap;
    container.register("googleClient", asValue(googleClientOriginal));
  });
});

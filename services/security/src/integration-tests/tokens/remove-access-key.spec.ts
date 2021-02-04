import { CREATED, NO_CONTENT } from "http-status-codes";
import * as request from "supertest";
import { GlobalData } from "../bootstrap";

describe("Access API key tests", () => {
  const GLOBAL = {} as GlobalData;
  const username = "superadmin";
  const password = "superadmin";

  before(() => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
  });

  it("Should remove access API key", async () => {
    const { authClient, app } = GLOBAL.bootstrap;
    const { accessToken } = await authClient.login(username, password);

    return request(app)
      .post("/api/tokens/create-access-key")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/)
      .expect(CREATED)
      .then((data) => {
        const { apiKey } = data.body;
        return request(app)
          .delete(`/api/tokens/remove-access-key/${apiKey}`)
          .set("Authorization", `Bearer ${accessToken}`)
          .expect(NO_CONTENT);
      });
  });
});

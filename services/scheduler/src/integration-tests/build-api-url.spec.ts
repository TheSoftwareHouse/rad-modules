import * as assert from "assert";
import { buildApiUrl } from "../scheduler/proxy-call/build-api-url";

describe("Build api url tests", () => {
  it("Should build full api url", async () => {
    const url = buildApiUrl("http://security", "/api/users");

    assert.strictEqual(url, "http://security/api/users");
  });

  it("Should build full api url with query params", async () => {
    const url = buildApiUrl("http://security", "/api/users", { id: "5", name: "test" });

    assert.strictEqual(url, "http://security/api/users?id=5&name=test");
  });
});

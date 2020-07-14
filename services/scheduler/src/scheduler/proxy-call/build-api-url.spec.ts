import * as assert from "assert";
import { buildApiUrl } from "./build-api-url";

describe("Build api url tests", () => {
  it("Should build full api url", async () => {
    const url = buildApiUrl("http://security", "/api/users");

    assert.equal(url, "http://security/api/users");
  });

  it("Should build full api url with query params", async () => {
    const url = buildApiUrl("http://security", "/api/users", { id: "5", name: "test" });

    assert.equal(url, "http://security/api/users?id=5&name=test");
  });
});

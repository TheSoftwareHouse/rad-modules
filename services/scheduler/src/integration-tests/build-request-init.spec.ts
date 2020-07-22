import * as assert from "assert";
import { buildRequestInit } from "../scheduler/proxy-call/build-request-init";

const contentTypeHeaders = { "Content-Type": "application/json" };

describe("Build-request-init tests", () => {
  it("Should build POST request-init without body.", async () => {
    const requestInit = buildRequestInit("POST", undefined);

    assert.deepStrictEqual(requestInit, {
      method: "POST",
      body: undefined,
      headers: contentTypeHeaders,
    });
  });

  it("Should build POST request-init with body.", async () => {
    const body = { a: 1, b: 2 };
    const requestInit = buildRequestInit("POST", body);

    assert.deepStrictEqual(requestInit, {
      method: "POST",
      body: JSON.stringify(body),
      headers: contentTypeHeaders,
    });
  });

  it("Should build POST request-init with custom headers.", async () => {
    const body = { a: 1, b: 2 };
    const requestInit = buildRequestInit("POST", body, { Authorization: "Bearer token", Custom: "custom value" });

    assert.deepStrictEqual(requestInit, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
        Custom: "custom value",
      },
    });
  });
});

import * as fetchMock from "fetch-mock";
import { createLogger } from "@tshio/logger";
import { httpEventHandler } from "../../shared/event-dispatcher/http-event-hander";
import { strictEqual } from "assert";

describe("Http event handler", () => {
  const logger = createLogger();

  const myFetch = fetchMock
    .sandbox()
    .mock("bad-url", 200)
    .mock("http://example.com/url1", 200)
    .mock("http://example.com/url2", 200)
    .mock("http://example.com/url3", 200);

  it("Fetches from provided URL", async () => {
    const eventDispatcherCallbackUrls = ["http://example.com/url1"];
    const handler = httpEventHandler({ logger, eventDispatcherCallbackUrls, myFetch });

    await handler({ name: "Event", payload: {} });

    strictEqual(myFetch.called("http://example.com/url1"), true);
    strictEqual(myFetch.called("http://example.com/url2"), false);
    strictEqual(myFetch.called("http://example.com/url3"), false);
  });

  it("Fetches from provided valid URLs", async () => {
    const eventDispatcherCallbackUrls = [
      "http://example.com/url1",
      "http://example.com/url2",
      "http://example.com/url3",
    ];
    const handler = httpEventHandler({ logger, eventDispatcherCallbackUrls, myFetch });

    await handler({ name: "Event", payload: {} });

    strictEqual(myFetch.called("http://example.com/url1"), true);
    strictEqual(myFetch.called("http://example.com/url2"), true);
    strictEqual(myFetch.called("http://example.com/url3"), true);
  });

  it("Doesn't fetch if provided URL is invalid", async () => {
    const eventDispatcherCallbackUrls = ["http://example.com/url1", "bad-url"];
    const handler = httpEventHandler({ logger, eventDispatcherCallbackUrls, myFetch });

    await handler({ name: "Event", payload: {} });

    strictEqual(myFetch.called("http://example.com/url1"), true);
    strictEqual(myFetch.called("bad-url"), false);
  });
});

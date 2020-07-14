import * as assert from "assert";
import * as request from "supertest";
import { Application } from "../app/application.types";
import { asValue, AwilixContainer } from "awilix";
import { appConfig } from "../config/config";
import { deepCloneAndHideKeys } from "../middleware/request-logger";
import { createContainer } from "../container";

describe("Request logger tests", () => {
  let app: Application;
  let container: AwilixContainer;
  let middlewareMessageText = "";
  let loggerStreamOriginal: any;
  const newLoggerStream = {
    write: (message: any) => {
      middlewareMessageText = message.toString();
    },
  };

  before(async () => {
    container = await createContainer(appConfig);
    app = container.resolve("app");
    loggerStreamOriginal = container.resolve("loggerStream");

    container.register("loggerStream", asValue(newLoggerStream));

    app = container.resolve("app");
  });

  it("Should display proper log via requestLogger", async () => {
    const validRegexp = /::ffff:127.0.0.1 POST \/api \d+ \d+.\d+ ms - req-body {"username":"user1","password":"passw0rd"} - api-key unknown - authorization unknown\b/;
    const oldKeysToHide = appConfig.requestLogger.keysToHide;

    appConfig.requestLogger.keysToHide = [];

    await request(app).post("/api").send({ username: "user1", password: "passw0rd" });

    assert(validRegexp.test(middlewareMessageText));

    appConfig.requestLogger.keysToHide = oldKeysToHide;
  });

  it("Should display proper log via requestLogger even if wrong body parameters", async () => {
    const validRegexp = /::ffff:127.0.0.1 POST \/api \d+ \d+.\d+ ms - req-body {"username":"wrongUser","password":"Hidden property, type = string"} - api-key unknown - authorization unknown\b/;

    await request(app).post("/api").send({ username: "wrongUser", password: "wrongPassword" });

    assert(validRegexp.test(middlewareMessageText));
  });

  it("Should hide authorization info if provided", async () => {
    const validRegexp = /::ffff:127.0.0.1 POST \/api \d+ \d+.\d+ ms - req-body no-body - api-key unknown - authorization Hidden, last six chars: .{6,6}\b/;

    await request(app).post("/api").set("Authorization", "Bearer InvalidTokenJustToTestIfItWillBeHidden");

    assert(validRegexp.test(middlewareMessageText));
  });

  it("Should obfuscate nested keys declared in array", async () => {
    const keysToHide = ["expert", "bad"];
    const userToClone = {
      name: "John",
      surname: "Dan",
      languages: {
        expert: "english",
        normal: "polish",
        bad: "esperanto",
      },
    };

    const deepCloneObjectWithHiddenKeys = deepCloneAndHideKeys(userToClone, keysToHide);

    assert.deepStrictEqual(deepCloneObjectWithHiddenKeys, {
      ...userToClone,
      languages: {
        ...userToClone.languages,
        bad: "Hidden property, type = string",
        expert: "Hidden property, type = string",
      },
    });
  });

  after(() => {
    container.register("loggerStream", asValue(loggerStreamOriginal));
  });
});

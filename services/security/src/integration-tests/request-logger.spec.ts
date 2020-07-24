import * as assert from "assert";
import * as request from "supertest";
import { asValue } from "awilix";
import { appConfig } from "../config/config";
import { deepCloneAndHideKeys } from "../middleware/request-logger";
import { GlobalData } from "./bootstrap";

describe("Middleware test", () => {
  const GLOBAL = {} as GlobalData;
  let middlewareMessageText = "";
  let loggerStreamOriginal: any;
  const newLoggerStream = {
    write: (message: any) => {
      middlewareMessageText = message.toString();
    },
  };

  before(() => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
    const { container } = GLOBAL.bootstrap;
    loggerStreamOriginal = container.resolve("loggerStream");
    container.register("loggerStream", asValue(newLoggerStream));
  });

  it("Should display obfuscate value from body in log via requestLogger if key set in keysToHide", async () => {
    const { container } = GLOBAL.bootstrap;
    const app = container.resolve("app");
    const validRegexp = /::ffff:127.0.0.1 POST \/api\/users\/login \d+ \d+.\d+ ms - req-body {"username":"user1","password":"Hidden property, type = string"} - api-key unknown - authorization unknown\b/;

    await request(app).post("/api/users/login").send({ username: "user1", password: "passw0rd" });

    assert(validRegexp.test(middlewareMessageText));
  });

  it("Should display obfuscate value in query string in log via requestLogger if key set in keysToHide", async () => {
    const { container } = GLOBAL.bootstrap;
    const app = container.resolve("app");
    const validRegexp = /::ffff:127.0.0.1 GET \/some-endpoint\?username=user1&password=Hidden property, type = string \d+ \d+.\d+ ms - req-body no-body - api-key unknown - authorization unknown\b/;

    await request(app).get("/some-endpoint").query({ username: "user1", password: "passw0rd" });
    assert(validRegexp.test(middlewareMessageText));
  });

  it("Should display proper log via requestLogger", async () => {
    const { container } = GLOBAL.bootstrap;
    const app = container.resolve("app");
    const validRegexp = /::ffff:127.0.0.1 POST \/api\/users\/login \d+ \d+.\d+ ms - req-body {"username":"user1","password":"passw0rd"} - api-key unknown - authorization unknown\b/;
    const oldKeysToHide = appConfig.requestLogger.keysToHide;
    appConfig.requestLogger.keysToHide = [];

    await request(app).post("/api/users/login").send({ username: "user1", password: "passw0rd" });

    assert(validRegexp.test(middlewareMessageText));
    appConfig.requestLogger.keysToHide = oldKeysToHide;
  });

  it("Should display proper log via requestLogger even if wrong body parameters", async () => {
    const { container } = GLOBAL.bootstrap;
    const app = container.resolve("app");
    const validRegexp = /::ffff:127.0.0.1 POST \/api\/users\/login \d+ \d+.\d+ ms - req-body {"username":"wrongUser","password":"Hidden property, type = string"} - api-key unknown - authorization unknown\b/;

    await request(app).post("/api/users/login").send({ username: "wrongUser", password: "wrongPassword" });

    assert(validRegexp.test(middlewareMessageText));
  });

  it("Should hide authorization info if provided", async () => {
    const { container } = GLOBAL.bootstrap;
    const app = container.resolve("app");
    const validRegexp = /::ffff:127.0.0.1 POST \/api\/tokens\/create-access-key \d+ \d+.\d+ ms - req-body no-body - api-key unknown - authorization Hidden, last six chars: .{6,6}\b/;
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ username: "superadmin", password: "superadmin" });

    const { accessToken } = loginResponse.body;

    await request(app).post("/api/tokens/create-access-key").set("Authorization", `Bearer ${accessToken}`);

    assert(validRegexp.test(middlewareMessageText));
  });

  it("Should obfuscate nested keys declared in array", async () => {
    const userToClone = {
      name: "John",
      surname: "Dan",
      languages: {
        expert: "english",
        normal: "polish",
        bad: "esperanto",
      },
    };
    const keysToHide = ["expert", "bad"];
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
    const { container } = GLOBAL.bootstrap;
    container.register("loggerStream", asValue(loggerStreamOriginal));
  });
});

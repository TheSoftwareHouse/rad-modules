import "mocha";
import * as assert from "assert";
import { EmailQueue } from "../utils/worker/email-queue";
import { BAD_REQUEST } from "http-status-codes";
import * as request from "supertest";
import { asValue } from "awilix";
import { GlobalData } from "./bootstrap";

describe("SMTP transport tests", () => {
  const GLOBAL = {} as GlobalData;
  let originalMailConfig = {};

  before(async () => {
    const { getBootstrap } = global as GlobalData;
    GLOBAL.bootstrap = getBootstrap();
    const { container } = GLOBAL.bootstrap;

    originalMailConfig = container.resolve("mailerConfig");
    container.register("mailerConfig", asValue({ ...originalMailConfig, type: "smtp" }));
  });

  it("Should send a mail.", async () => {
    const { container } = GLOBAL.bootstrap;
    const emailQueue = container.resolve<EmailQueue>("emailQueue");

    await emailQueue.add(["1"]);
    await emailQueue.add(["2"]);
    await emailQueue.add(["3"]);
    await emailQueue.add(["4"]);
    await emailQueue.add(["5"]);
    await emailQueue.add(["6"]);

    const emails = await emailQueue.get(50);
    assert.strictEqual(emails.length, 6);
  }).timeout(15000);

  it("Should return 400 - bad request response", () => {
    const body = {};
    const { app } = GLOBAL.bootstrap;

    return request(app).post("/api/mailer/send").send(body).expect(BAD_REQUEST);
  });

  after(async () => {
    const { container } = GLOBAL.bootstrap;
    container.register("mailerConfig", asValue({ ...originalMailConfig }));
  });
});

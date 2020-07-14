/* eslint-disable import/first */
process.env.TRANSPORT_TYPE = "smtp";

import * as assert from "assert";
import { EmailQueue } from "../utils/worker/email-queue";
import { BAD_REQUEST } from "http-status-codes";
import * as request from "supertest";
import { Application } from "../app/application.types";
import "mocha";
import { createContainer } from "../container";
import { appConfig } from "../config/config";

describe("SMTP transport tests", () => {
  let app: Application;
  let emailQueue: EmailQueue;

  before(async () => {
    const container = await createContainer(appConfig);
    app = container.resolve("app");
    emailQueue = container.resolve("emailQueue");
  });

  it("Should send a mail.", async () => {
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

    return request(app).post("/api/mailer/send").send(body).expect(BAD_REQUEST);
  });
});

import "mocha";
import * as request from "supertest";
import { CREATED } from "http-status-codes";
import { asValue } from "awilix";
import { base64JpgFile, base64PdfFile } from "./resources";
import { GlobalData } from "./bootstrap";

describe("SendGrid transport tests", () => {
  const GLOBAL = {} as GlobalData;
  let originalMailConfig = {};

  before(async () => {
    const { getBootstrap } = global as any;
    GLOBAL.bootstrap = getBootstrap();
    const { container } = GLOBAL.bootstrap;

    originalMailConfig = container.resolve("mailerConfig");
    container.register("mailerConfig", asValue({ ...originalMailConfig, type: "sendgrid" }));
  });

  it("Should send a mail.", () => {
    const { container } = GLOBAL.bootstrap;
    const app = container.resolve("app");

    const body = {
      emails: [
        {
          sender: {
            name: "Marcin Kopa",
            email: "marcin.mentoring@gmail.com",
          },
          recipient: {
            to: ["marcin.mentoring@gmail.com"],
          },
          template: {
            id: "test",
            parameters: {
              firstName: "Antonio",
              lastName: "Hernández",
            },
          },
          attachments: [base64JpgFile, base64PdfFile],
        },
      ],
    };

    return request(app).post("/api/mailer/send").send(body).expect(CREATED);
  }).timeout(15000);
});

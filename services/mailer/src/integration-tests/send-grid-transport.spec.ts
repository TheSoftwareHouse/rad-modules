/* eslint-disable import/first */

process.env.TRANSPORT_TYPE = "sendgrid";

import { CREATED } from "http-status-codes";
import * as request from "supertest";
import { Application } from "../app/application.types";
import "mocha";
import { createContainer } from "../container";
import { appConfig } from "../config/config";
import { base64JpgFile, base64PdfFile } from "./resources";

describe("SendGrid transport tests", () => {
  let app: Application;

  before(async () => {
    const container = await createContainer(appConfig);
    app = container.resolve("app");
  });

  it("Should send a mail.", () => {
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
            id: "d-082e77fff1144c008779a3dffe11d202",
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

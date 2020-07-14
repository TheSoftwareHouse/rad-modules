import { OK } from "http-status-codes";
import { Application } from "../app/application.types";
import * as request from "supertest";
import * as fs from "fs";
import { createContainer } from "../container";
import { appConfig } from "../config/config";

describe("Swagger definitions tests", () => {
  let app: Application;

  before(async () => {
    const container = await createContainer(appConfig);
    app = container.resolve("app");
  });

  it("Should create mailer.json file", () => {
    return request(app)
      .get("/api-docs.json")
      .expect(OK)
      .then((data) =>
        fs.writeFileSync("/app/services/mailer/swagger/mailer.json", Buffer.from(JSON.stringify(data.body, null, 2))),
      );
  });
});

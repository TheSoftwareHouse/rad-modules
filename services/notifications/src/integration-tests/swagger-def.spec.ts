import { OK } from "http-status-codes";
import { Application } from "../app/application.types";
import * as request from "supertest";
import * as fs from "fs";

describe("Swagger definitions tests", () => {
  let app: Application;
  let container: any;

  before(async () => {
    const { container: globalContainer } = global as any;
    container = globalContainer;
    app = container.resolve("app");
  });

  it("Should create notifications.json file", () => {
    return request(app)
      .get("/api-docs.json")
      .expect(OK)
      .then((data) =>
        fs.writeFileSync(
          "/app/services/notifications/swagger/notifications.json",
          Buffer.from(JSON.stringify(data.body, null, 2)),
        ),
      );
  });
});

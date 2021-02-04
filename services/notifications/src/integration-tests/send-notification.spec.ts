import * as assert from "assert";
import * as io from "socket.io-client";
import * as request from "supertest";
import { sign } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { Application } from "../app/application.types";
import { TokenConfig } from "../config/config";
import { appConfig } from "../config/config";
import { isUuid } from "../../../../shared/test-utils";
import { NotificationModel } from "../app/features/notifications/models/notification.model";

const notifyUrl = "http://localhost:30050";

const options = {
  transports: ["websocket"],
  "force new connection": true,
};

const generateToken = async (userId: string, tokenConfig: TokenConfig): Promise<string> => {
  return new Promise((resolve, reject) => {
    sign(
      { userId },
      tokenConfig.secret,
      { expiresIn: tokenConfig.expirationInSeconds },
      (err: Error | null, token?: string) => {
        if (err) {
          return reject(new Error("Failed to sign a token"));
        }

        return resolve(token as string);
      },
    );
  });
};

describe("send.action", () => {
  let app: Application;
  const userId = "user1";
  let token = "";

  before(async () => {
    const { container } = global as any;
    app = container.resolve("app");
    const notificationsBroker = container.resolve("notificationsBroker");
    await notificationsBroker.start();
    token = await generateToken(userId, appConfig.accessTokenConfig);
  });

  it("Should disconnect when provide bad token", (done) => {
    const notifyClient = io.connect(`${notifyUrl}?token=bad_token`, options);
    notifyClient.on("disconnect", () => {
      done();
    });
  });

  it("Should connect as anonymous user", (done) => {
    const notifyClient = io.connect(notifyUrl, { ...options, query: {} });

    notifyClient.on("default-all", async (message: string) => {
      if (message === "123") {
        notifyClient.disconnect();
        done();
      }
    });

    notifyClient.on("connect", async () => {
      await request(app).post("/api/notifications/send").send({ message: "123" }).expect(StatusCodes.CREATED);
    });
  });

  it("Request OK", async () => {
    return request(app).post("/api/notifications/send").send({ message: "123" }).expect(StatusCodes.CREATED);
  });

  it("Should receive notify that sent to specific userId.", (done) => {
    const notifyClient = io.connect(`${notifyUrl}?token=${token}`, options);
    notifyClient.on("message", async (message: string) => {
      if (message === "123") {
        notifyClient.disconnect();
        done();
      }
    });

    notifyClient.on("connect", async () => {
      await request(app)
        .post("/api/notifications/send")
        .send({ channels: ["user1"], message: "123" })
        .expect(StatusCodes.CREATED);
    });
  });

  it("Should receive notify that sent to everybody", (done) => {
    const notifyClient = io.connect(`${notifyUrl}?token=${token}`, options);
    notifyClient.on("default-all", async (message: string) => {
      if (message === "123") {
        notifyClient.disconnect();
        done();
      }
    });

    notifyClient.on("connect", async () => {
      await request(app).post("/api/notifications/send").send({ message: "123" }).expect(StatusCodes.CREATED);
    });
  });

  it("Bad request", () => {
    return request(app).post("/api/notifications/send").send({}).expect(StatusCodes.BAD_REQUEST);
  });

  it("Should return notificationsIds in in body response", async () => {
    const { body } = await request(app)
      .post("/api/notifications/send")
      .send({ message: "123" })
      .expect(StatusCodes.CREATED);

    assert(Array.isArray(body?.notificationsIds));
    assert(isUuid(body?.notificationsIds[0]));
  });

  it("Should save many notifications with same message and different channels in DB", async () => {
    await request(app)
      .post("/api/notifications/send")
      .send({ channels: ["test1", "test2", "test3"], message: "123" })
      .expect(StatusCodes.CREATED);

    const { body } = await request(app).get("/api/notifications/get-notifications").send({}).expect(StatusCodes.OK);

    const { notifications, total }: { notifications: NotificationModel[]; total: number } = body;

    assert(notifications.length <= 25);
    assert(total === 3);
    assert(notifications.every(({ message }) => message === "123"));
    assert(notifications.some(({ channel }) => channel === "test1"));
    assert(notifications.some(({ channel }) => channel === "test2"));
    assert(notifications.some(({ channel }) => channel === "test3"));
  });

  it("Endpoint get-notifications should returns notifications", async () => {
    await request(app)
      .post("/api/notifications/send")
      .send({ channels: ["test1", "test2", "test3"], message: "123" })
      .expect(StatusCodes.CREATED);

    const { body } = await request(app).get("/api/notifications/get-notifications").expect(StatusCodes.OK);

    const { notifications, total }: { notifications: NotificationModel[]; total: number } = body;

    assert(notifications.length <= 25);
    assert(total === 3);
    assert(notifications.every(({ message }) => message === "123"));
    assert(notifications.some(({ channel }) => channel === "test1"));
    assert(notifications.some(({ channel }) => channel === "test2"));
    assert(notifications.some(({ channel }) => channel === "test3"));
  });

  it("Endpoint get-notifications should returns filtered notifications by notification channel", async () => {
    await request(app)
      .post("/api/notifications/send")
      .send({ channels: ["test1", "test2", "test3"], message: "123" })
      .expect(StatusCodes.CREATED);

    const { body } = await request(app)
      .get("/api/notifications/get-notifications?filter[channel][eq]=test1")
      .expect(StatusCodes.OK);

    const { notifications, total }: { notifications: NotificationModel[]; total: number } = body;
    const [firstNotification] = notifications;

    assert.strictEqual(notifications.length, 1);
    assert.strictEqual(total, 1);
    assert.deepStrictEqual(firstNotification.channel, "test1");
    assert.deepStrictEqual(firstNotification.message, "123");
  });
});

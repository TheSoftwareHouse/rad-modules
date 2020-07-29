import * as assert from "assert";
import * as io from "socket.io-client";
import * as request from "supertest";
import { sign } from "jsonwebtoken";
import { BAD_REQUEST, CREATED } from "http-status-codes";
import { Application } from "../app/application.types";
import { TokenConfig } from "../config/config";
import { appConfig } from "../config/config";
import { isUuid, isDate } from "../../../../shared/test-utils";
import { NotificationsRepository } from "../repositories/notifications.repository";

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

        return resolve(token);
      },
    );
  });
};

describe("send.action", () => {
  let app: Application;
  let notificationsRepository: NotificationsRepository;
  const userId = "user1";
  let token = "";

  before(async () => {
    const { container } = global as any;
    app = container.resolve("app");
    notificationsRepository = container.resolve("notificationsRepository");
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
      await request(app).post("/api/notifications/send").send({ message: "123" }).expect(CREATED);
    });
  });

  it("Request OK", async () => {
    return request(app).post("/api/notifications/send").send({ message: "123" }).expect(CREATED);
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
        .expect(CREATED);
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
      await request(app).post("/api/notifications/send").send({ message: "123" }).expect(CREATED);
    });
  });

  it("Bad request", () => {
    return request(app).post("/api/notifications/send").send({}).expect(BAD_REQUEST);
  });

  it("Should return notificationsIds in in body response", async () => {
    const { body } = await request(app).post("/api/notifications/send").send({ message: "123" }).expect(CREATED);

    assert(Array.isArray(body?.notificationsIds));
    assert(isUuid(body?.notificationsIds[0]));
  });

  it("Should save notification in DB after send", async () => {
    await request(app).post("/api/notifications/send").send({ message: "123" }).expect(CREATED);
    const { notifications, total } = await notificationsRepository.getNotifications();
    const [firstNotification] = notifications;

    assert(isUuid(firstNotification.id));
    assert(isDate(firstNotification.createdAt));
    assert(isDate(firstNotification.updatedAt));
    assert.deepStrictEqual(notifications.length, 1);
    assert.deepStrictEqual(total, 1);
    assert.deepStrictEqual(firstNotification.chanel, "default-all");
    assert.deepStrictEqual(firstNotification.message, "123");
  });

  it("Should save many notification with same message and differ channels in DB", async () => {
    await request(app)
      .post("/api/notifications/send")
      .send({ channels: ["test1", "test2", "test3"], message: "123" })
      .expect(CREATED);
    const { notifications, total } = await notificationsRepository.getNotifications();

    assert.deepStrictEqual(notifications.length, 3);
    assert.deepStrictEqual(total, 3);
    assert(notifications.every(({ message }) => message === "123"));
    assert(notifications.some(({ chanel }) => chanel === "test1"));
    assert(notifications.some(({ chanel }) => chanel === "test2"));
    assert(notifications.some(({ chanel }) => chanel === "test3"));
  });
});

import * as io from "socket.io-client";
import { Application } from "../app/application.types";
import { TokenConfig } from "../config/config";
import { sign } from "jsonwebtoken";
import { appConfig } from "../config/config";
import * as request from "supertest";
import { BAD_REQUEST, CREATED } from "http-status-codes";

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

describe("Notifications tests", () => {
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
});

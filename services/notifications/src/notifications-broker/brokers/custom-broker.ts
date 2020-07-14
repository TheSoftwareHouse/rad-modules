import { GenericNotificationsBroker } from "../notifications-broker";
import * as socketIo from "socket.io";
import { Logger } from "winston";

import { createServer, Server } from "http";
import { JwtUtils } from "../../tokens/jwt-utils";

export interface CustomBrokerProps {
  transportConfig: {
    websocketPort: number;
  };
  allowAnonymous: boolean;
  jwtUtils: JwtUtils;
  logger: Logger;
}

interface Client {
  socketId: string;
  userId: string;
  token: string;
}

export class CustomBroker implements GenericNotificationsBroker {
  constructor(private dependencies: CustomBrokerProps) {}

  private io: SocketIO.Server;

  public async start() {
    const server: Server = createServer();
    this.io = socketIo(server);

    server.listen(this.dependencies.transportConfig.websocketPort, () => {
      this.dependencies.logger.info(`Server listening on ${this.dependencies.transportConfig.websocketPort}`);
      this.newClient();
    });
  }

  private newClient() {
    this.io.on("connect", (socket) => {
      const { token } = socket.handshake.query;
      try {
        if (token !== undefined) {
          const payload = this.dependencies.jwtUtils.tryToGetPayloadFromTokenOrThrow(token);
          socket.join(payload.userId);
          socket.join("default-authorized");
        } else if (!this.dependencies.allowAnonymous) {
          throw new Error("Anonymous users not allowed");
        } else {
          socket.join("default-unauthorized");
        }
        socket.join("default-all");
      } catch {
        socket.disconnect(true);
      }
    });
  }

  public async send(channels: string[], message: string) {
    if (channels.length) {
      const emitMessages = channels.map(async (channel) => this.io.to(channel).emit("message", message));
      await Promise.all(emitMessages);
      return;
    }
    this.io.to("default-all").emit("default-all", message);
  }
}

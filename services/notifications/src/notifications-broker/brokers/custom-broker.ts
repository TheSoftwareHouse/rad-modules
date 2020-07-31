import { GenericNotificationsBroker, NotificationsBrokerProps } from "../notifications-broker";
import * as socketIo from "socket.io";
import { createServer, Server } from "http";
import { NotificationModel } from "../../app/features/notifications/models/notification.model";

export class CustomBroker implements GenericNotificationsBroker {
  constructor(private dependencies: NotificationsBrokerProps) {}

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
    const { socketDefaultName, socketAuthorizedName, socketUnauthorizedName } = this.dependencies;
    this.io.on("connect", (socket) => {
      const { token } = socket.handshake.query;
      try {
        if (token !== undefined) {
          const payload = this.dependencies.jwtUtils.tryToGetPayloadFromTokenOrThrow(token);
          socket.join(payload.userId);
          socket.join(socketAuthorizedName);
        } else if (!this.dependencies.allowAnonymous) {
          throw new Error("Anonymous users not allowed");
        } else {
          socket.join(socketUnauthorizedName);
        }
        socket.join(socketDefaultName);
      } catch {
        socket.disconnect(true);
      }
    });
  }

  public async send(channels: string[], message: string): Promise<string[]> {
    const { socketDefaultName, notificationsRepository } = this.dependencies;

    if (channels.length) {
      const emitMessages = channels.map(async (channel) => this.io.to(channel).emit("message", message));
      await Promise.all(emitMessages);

      const notifications = await notificationsRepository.addManyNotifications(
        NotificationModel.createMany(channels, message),
      );

      return notifications.map(({ id }) => id);
    }

    this.io.to(socketDefaultName).emit(socketDefaultName, message);
    const notification = await notificationsRepository.addNotification(
      NotificationModel.create({ channel: socketDefaultName, message }),
    );

    return [notification.id];
  }
}

import { TransportType } from "../config/config";
import { CustomBroker } from "./brokers/custom-broker";
import { JwtUtils } from "../tokens/jwt-utils";
import { Logger } from "@tshio/logger";
import { NotificationsRepository } from "../repositories/notifications.repository";

export interface GenericNotificationsBroker {
  start: () => Promise<void>;
  send: (usersId: string[], message: string) => Promise<string[]>;
}

export interface NotificationsBrokerProps {
  transportType: TransportType;
  transportConfig: any;
  allowAnonymous: boolean;
  jwtUtils: JwtUtils;
  logger: Logger;
  socketDefaultName: string;
  socketAuthorizedName: string;
  socketUnauthorizedName: string;
  notificationsRepository: NotificationsRepository;
  customBroker: CustomBroker;
}

export class NotificationsBroker implements GenericNotificationsBroker {
  private broker: GenericNotificationsBroker;

  constructor(dependencies: NotificationsBrokerProps) {
    switch (dependencies.transportType) {
      case TransportType.WebSocket: {
        const { customBroker } = dependencies;
        this.broker = customBroker;

        break;
      }
      default:
        throw new Error("Bad transport type");
    }
  }

  public start() {
    return this.broker.start();
  }

  public async send(usersId: string[], message: string) {
    return this.broker.send(usersId, message);
  }
}

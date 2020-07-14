import { TransportType } from "../config/config";
import { CustomBroker } from "./brokers/custom-broker";
import { JwtUtils } from "../tokens/jwt-utils";
import { Logger } from "winston";

export interface GenericNotificationsBroker {
  start: () => Promise<void>;
  send: (usersId: string[], message: string) => Promise<void>;
}

export interface NotificationsBrokerProps {
  transportType: TransportType;
  transportConfig: any;
  allowAnonymous: boolean;
  jwtUtils: JwtUtils;
  logger: Logger;
}

export class NotificationsBroker implements GenericNotificationsBroker {
  private broker: GenericNotificationsBroker;

  constructor(dependencies: NotificationsBrokerProps) {
    switch (dependencies.transportType) {
      case TransportType.WebSocket: {
        const { transportConfig, allowAnonymous, jwtUtils, logger } = dependencies;
        this.broker = new CustomBroker({
          transportConfig,
          allowAnonymous,
          jwtUtils,
          logger,
        });

        break;
      }
      default:
        throw new Error("Bad transport type");
    }
  }

  public start() {
    return this.broker.start();
  }

  public send(usersId: string[], message: string) {
    return this.broker.send(usersId, message);
  }
}

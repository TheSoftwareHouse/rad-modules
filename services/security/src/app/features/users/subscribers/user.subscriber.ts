import { EventSubscriberInterface, EventSubscribersMeta } from "../../../../shared/event-dispatcher";
import { Logger } from "winston";
import {
  UserActivatedEvent,
  UserAddedEvent,
  UserAttributeAddedEvent,
  UserAttributeRemovedEvent,
  UserDeactivatedEvent,
  UserRemovedEvent,
} from "./user.event";
import { EventHandler } from "../../../../shared/event-dispatcher/http-event-hander";

export interface UserEventSubscriberProps {
  logger: Logger;
  httpEventHandler: EventHandler;
}

export default class UserEventSubscriber implements EventSubscriberInterface {
  constructor(private dependencies: UserEventSubscriberProps) {}

  getSubscribedEvents(): EventSubscribersMeta[] {
    return [
      { name: "UserAttributeAdded", method: "userAttributeAdded" },
      { name: "UserAttributeRemoved", method: "userAttributeRemoved" },
      { name: "UserActivated", method: "userActivated" },
      { name: "UserDeactivated", method: "userDeactivated" },
      { name: "UserAdded", method: "userAdded" },
      { name: "UserRemoved", method: "userRemoved" },
    ];
  }

  public async userAttributeAdded(event: UserAttributeAddedEvent) {
    this.dependencies.logger.info(`UserAttributeAdded: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }

  public async userAttributeRemoved(event: UserAttributeRemovedEvent) {
    this.dependencies.logger.info(`UserAttributeRemoved: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }

  public async userActivated(event: UserActivatedEvent) {
    this.dependencies.logger.info(`UserActivated: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }

  public async userDeactivated(event: UserDeactivatedEvent) {
    this.dependencies.logger.info(`UserDeactivated: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }

  public async userAdded(event: UserAddedEvent) {
    this.dependencies.logger.info(`UserAdded: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }

  public async userRemoved(event: UserRemovedEvent) {
    this.dependencies.logger.info(`UserRemoved: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }
}

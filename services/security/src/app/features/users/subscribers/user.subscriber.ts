import { Event, EventSubscriberInterface, EventSubscribersMeta } from "../../../../shared/event-dispatcher";
import { Logger } from "winston";
import { PolicyEventSubscriberProps } from "../../policy/subscribers/policy.subscriber";

export interface UserAttributeAddedEvent extends Event {}
export interface UserAttributeRemovedEvent extends Event {}
export interface UserActivatedEvent extends Event {}
export interface UserDeactivatedEvent extends Event {}
export interface UserAddedEvent extends Event {}
export interface UserRemovedEvent extends Event {}

export interface UserEventSubscriberProps {
  logger: Logger;
}

export default class UserEventSubscriber implements EventSubscriberInterface {
  constructor(private dependencies: PolicyEventSubscriberProps) {}

  getSubscribedEvents(): EventSubscribersMeta[] {
    return [
      { name: "userAttributeAdded", method: "UserAttributeAdded" },
      { name: "userAttributeRemoved", method: "UserAttributeRemoved" },
      { name: "userActivated", method: "UserActivated" },
      { name: "userDeactivated", method: "UserDeactivated" },
      { name: "userAdded", method: "UserAdded" },
      { name: "userRemoved", method: "UserRemoved" },
    ];
  }

  public async UserAttributeAdded(event: UserAttributeAddedEvent) {
    this.dependencies.logger.info(`UserAttributeAdded: ${JSON.stringify(event.payload)}`);
  }

  public async UserAttributeRemoved(event: UserAttributeRemovedEvent) {
    this.dependencies.logger.info(`UserAttributeRemoved: ${JSON.stringify(event.payload)}`);
  }

  public async UserActivated(event: UserActivatedEvent) {
    this.dependencies.logger.info(`UserActivated: ${JSON.stringify(event.payload)}`);
  }

  public async UserDeactivated(event: UserDeactivatedEvent) {
    this.dependencies.logger.info(`UserDeactivated: ${JSON.stringify(event.payload)}`);
  }

  public async UserAdded(event: UserAddedEvent) {
    this.dependencies.logger.info(`UserAdded: ${JSON.stringify(event.payload)}`);
  }

  public async UserRemoved(event: UserRemovedEvent) {
    this.dependencies.logger.info(`UserRemoved: ${JSON.stringify(event.payload)}`);
  }
}

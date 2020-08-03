import { EventSubscriberInterface, EventSubscribersMeta } from "../../../../shared/event-dispatcher";
import { Logger } from "winston";
import { EventHandler } from "../../../../shared/event-dispatcher/http-event-hander";
import { PolicyAddedEvent } from "./events/policy-added.event";
import { PolicyRemovedEvent } from "./events/policy-removed.event";

export interface PolicyEventSubscriberProps {
  logger: Logger;
  httpEventHandler: EventHandler;
}

export default class PolicyEventSubscriber implements EventSubscriberInterface {
  constructor(private dependencies: PolicyEventSubscriberProps) {}

  getSubscribedEvents(): EventSubscribersMeta[] {
    return [
      { name: PolicyAddedEvent.name, method: "policyAdded" },
      { name: PolicyRemovedEvent.name, method: "policiesRemoved" },
    ];
  }

  public async policyAdded(event: PolicyAddedEvent) {
    this.dependencies.logger.info(`${typeof event}: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }

  public async policiesRemoved(event: PolicyRemovedEvent) {
    this.dependencies.logger.info(`${typeof event}: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }
}

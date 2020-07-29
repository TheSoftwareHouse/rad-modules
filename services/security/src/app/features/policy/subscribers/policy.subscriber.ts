import { EventSubscriberInterface, EventSubscribersMeta } from "../../../../shared/event-dispatcher";
import { Logger } from "winston";
import { PolicyAddedEvent, PolicyRemovedEvent } from "./policy.event";
import { EventHandler } from "../../../../shared/event-dispatcher/http-event-hander";

export interface PolicyEventSubscriberProps {
  logger: Logger;
  httpEventHandler: EventHandler;
}

export default class PolicyEventSubscriber implements EventSubscriberInterface {
  constructor(private dependencies: PolicyEventSubscriberProps) {}

  getSubscribedEvents(): EventSubscribersMeta[] {
    return [
      { name: "PolicyAdded", method: "policyAdded" },
      { name: "PoliciesRemoved", method: "policiesRemoved" },
    ];
  }

  public async policyAdded(event: PolicyAddedEvent) {
    this.dependencies.logger.info(`PolicyAdded: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }

  public async policiesRemoved(event: PolicyRemovedEvent) {
    this.dependencies.logger.info(`PoliciesRemoved: ${JSON.stringify(event.payload)}`);
    return this.dependencies.httpEventHandler(event);
  }
}

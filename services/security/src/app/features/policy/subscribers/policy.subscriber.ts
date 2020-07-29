import { Event, EventSubscriberInterface, EventSubscribersMeta } from "../../../../shared/event-dispatcher";
import { Logger } from "winston";

export interface PolicyAddedEvent extends Event {}
export interface PolicyRemovedEvent extends Event {}

export interface PolicyEventSubscriberProps {
  logger: Logger;
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
  }

  public async policiesRemoved(event: PolicyRemovedEvent) {
    this.dependencies.logger.info(`PoliciesRemoved: ${JSON.stringify(event.payload)}`);
  }
}

import { Event } from "../../../../shared/event-dispatcher";

interface PolicyEventPayload {
  policyId: string;
  attributeName: string;
  resourceName: string;
}

export interface PolicyAddedEvent extends Event {
  payload: PolicyEventPayload;
}

export interface PolicyRemovedEvent extends Event {
  payload: PolicyEventPayload[];
}

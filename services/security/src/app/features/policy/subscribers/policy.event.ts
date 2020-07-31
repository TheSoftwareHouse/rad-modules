import { Event } from "../../../../shared/event-dispatcher";

interface PolicyEventPayload {
  id: string;
  attribute: string;
  resource: string;
}

export interface PolicyAddedEvent extends Event {
  payload: PolicyEventPayload;
}

export interface PolicyRemovedEvent extends Event {
  payload: PolicyEventPayload[];
}

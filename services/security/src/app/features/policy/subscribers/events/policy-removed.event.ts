import { Event } from "../../../../../shared/event-dispatcher";
import { PolicyEventPayload } from "./policy.event";

export class PolicyRemovedEvent implements Event {
  name: string;

  public constructor(public payload: PolicyEventPayload[]) {
    this.name = "PolicyRemovedEvent";
  }
}

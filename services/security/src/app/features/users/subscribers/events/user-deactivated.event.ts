import { UserEvent, UserEventPayload } from "./user.event";

export class UserDeactivatedEvent extends UserEvent {
  public constructor(public payload: UserEventPayload) {
    super();
    this.name = "UserDeactivatedEvent";
  }
}

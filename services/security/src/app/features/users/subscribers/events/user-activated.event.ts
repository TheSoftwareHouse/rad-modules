import { UserEvent, UserEventPayload } from "./user.event";

export class UserActivatedEvent extends UserEvent {
  public constructor(public payload: UserEventPayload) {
    super();
    this.name = "UserActivated";
  }
}

import { UserEvent, UserEventPayload } from "./user.event";

export class UserAddedEvent extends UserEvent {
  public constructor(public payload: UserEventPayload) {
    super();
    this.name = "UserAddedEvent";
  }
}

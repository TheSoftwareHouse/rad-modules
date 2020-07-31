import { UserEvent, UserEventPayload } from "./user.event";

export class UserRemovedEvent extends UserEvent {
  public constructor(public payload: UserEventPayload) {
    super();
    this.name = "UserRemoved";
  }
}

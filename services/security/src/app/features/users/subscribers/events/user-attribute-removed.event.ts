import { UserEvent, UserEventPayload } from "./user.event";

export class UserAttributeRemovedEvent extends UserEvent {
  public constructor(public payload: UserEventPayload) {
    super();
    this.name = "UserAttributeRemoved";
  }
}

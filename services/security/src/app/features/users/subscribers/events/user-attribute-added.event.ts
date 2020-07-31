import { UserEvent, UserEventPayload } from "./user.event";

export class UserAttributeAddedEvent extends UserEvent {
  public constructor(public payload: UserEventPayload) {
    super();
    this.name = "UserAttributeAdded";
  }
}

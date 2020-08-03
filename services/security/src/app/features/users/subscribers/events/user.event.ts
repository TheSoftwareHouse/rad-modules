import { Event } from "../../../../../shared/event-dispatcher";

export interface UserEventAttributePayload {
  id: string;
  name: string;
}

export interface UserEventPayload {
  userId: string;
  attributes: UserEventAttributePayload[];
}

export class UserEvent implements Event {
  name: string;

  payload: UserEventPayload;
}

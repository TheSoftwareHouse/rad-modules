import { Event } from "../../../../shared/event-dispatcher";

export interface UserEventAttributePayload {
  attributeId: string;
  attributeName: string;
}

export interface UserEventPayload {
  userId: string;
  attributes: UserEventAttributePayload[];
}

interface UserEvent extends Event {
  payload: UserEventPayload;
}

export interface UserAttributeAddedEvent extends UserEvent {}

export interface UserAttributeRemovedEvent extends UserEvent {}

export interface UserActivatedEvent extends UserEvent {}

export interface UserDeactivatedEvent extends UserEvent {}

export interface UserAddedEvent extends UserEvent {}

export interface UserRemovedEvent extends UserEvent {}

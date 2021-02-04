import { Command } from "@tshio/command-bus";

export const REMOVE_ATTRIBUTE_COMMAND_TYPE = "users/REMOVEATTRIBUTE";

export interface RemoveAttributeCommandPayload {
  attributes: string[];
  userId: string;
}

export class RemoveAttributeCommand implements Command<RemoveAttributeCommandPayload> {
  public type: string = REMOVE_ATTRIBUTE_COMMAND_TYPE;

  constructor(public payload: RemoveAttributeCommandPayload) {}
}

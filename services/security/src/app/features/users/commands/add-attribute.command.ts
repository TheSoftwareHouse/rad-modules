import { Command } from "../../../../../../../shared/command-bus";

export const ADD_ATTRIBUTE_COMMAND_TYPE = "users/ADDATTRIBUTE";

export interface AddAttributeCommandPayload {
  attributes: string[];
  userId: string;
}

export class AddAttributeCommand implements Command<AddAttributeCommandPayload> {
  public type: string = ADD_ATTRIBUTE_COMMAND_TYPE;

  constructor(public payload: AddAttributeCommandPayload) {}
}

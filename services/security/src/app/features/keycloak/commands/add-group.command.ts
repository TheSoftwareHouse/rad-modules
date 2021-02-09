import { Command } from "@tshio/command-bus";

export const ADD_GROUP_COMMAND_TYPE = "keycloak/ADDGROUP";

export interface AddGroupCommandPayload {
  name: string;
}

export class AddGroupCommand implements Command<AddGroupCommandPayload> {
  public type: string = ADD_GROUP_COMMAND_TYPE;

  constructor(public payload: AddGroupCommandPayload) {}
}

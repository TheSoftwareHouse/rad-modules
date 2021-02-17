import { Command } from "@tshio/command-bus";

export const ADD_USER_TO_GROUP_COMMAND_TYPE = "keycloak/ADDUSERTOGROUP";

export interface AddUserToGroupCommandPayload {
  username: string;
  group: string;
}

export class AddUserToGroupCommand implements Command<AddUserToGroupCommandPayload> {
  public type: string = ADD_USER_TO_GROUP_COMMAND_TYPE;

  constructor(public payload: AddUserToGroupCommandPayload) {}
}

import { Command } from "@tshio/command-bus";

export const REMOVE_USER_FROM_GROUP_COMMAND_TYPE = "keycloak/REMOVEUSERFROMGROUP";

export interface RemoveUserFromGroupCommandPayload {
  username: string;
  group: string;
}

export class RemoveUserFromGroupCommand implements Command<RemoveUserFromGroupCommandPayload> {
  public type: string = REMOVE_USER_FROM_GROUP_COMMAND_TYPE;

  constructor(public payload: RemoveUserFromGroupCommandPayload) {}
}

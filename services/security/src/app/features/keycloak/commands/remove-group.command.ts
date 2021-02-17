import { Command } from "@tshio/command-bus";

export const REMOVE_GROUP_COMMAND_TYPE = "keycloak/REMOVEGROUP";

export interface RemoveGroupCommandPayload {
  name: string;
}

export class RemoveGroupCommand implements Command<RemoveGroupCommandPayload> {
  public type: string = REMOVE_GROUP_COMMAND_TYPE;

  constructor(public payload: RemoveGroupCommandPayload) {}
}

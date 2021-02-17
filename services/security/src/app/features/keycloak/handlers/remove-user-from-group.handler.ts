import { CommandHandler } from "@tshio/command-bus";
import {
  REMOVE_USER_FROM_GROUP_COMMAND_TYPE,
  RemoveUserFromGroupCommand,
} from "../commands/remove-user-from-group.command";
import { KeycloakManager } from "../../../../utils/keycloak/keycloak-manager";

export interface RemoveUserFromGroupHandlerProps {
  keycloakManager: KeycloakManager;
}

export default class RemoveUserFromGroupHandler implements CommandHandler<RemoveUserFromGroupCommand> {
  public commandType: string = REMOVE_USER_FROM_GROUP_COMMAND_TYPE;

  constructor(private dependencies: RemoveUserFromGroupHandlerProps) {}

  async execute(command: RemoveUserFromGroupCommand) {
    const { keycloakManager } = this.dependencies;

    return keycloakManager.removeUserFromGroup(command.payload.username, command.payload.group);
  }
}

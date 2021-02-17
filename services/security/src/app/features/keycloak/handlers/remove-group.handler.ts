import { CommandHandler } from "@tshio/command-bus";
import { REMOVE_GROUP_COMMAND_TYPE, RemoveGroupCommand } from "../commands/remove-group.command";
import { KeycloakManager } from "../../../../utils/keycloak/keycloak-manager";

export interface RemoveGroupHandlerProps {
  keycloakManager: KeycloakManager;
}

export default class RemoveGroupHandler implements CommandHandler<RemoveGroupCommand> {
  public commandType: string = REMOVE_GROUP_COMMAND_TYPE;

  constructor(private dependencies: RemoveGroupHandlerProps) {}

  async execute(command: RemoveGroupCommand) {
    const { keycloakManager } = this.dependencies;

    return keycloakManager.removeGroup(command.payload.name);
  }
}

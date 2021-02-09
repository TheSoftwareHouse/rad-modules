import { CommandHandler } from "@tshio/command-bus";
import { ADD_GROUP_COMMAND_TYPE, AddGroupCommand } from "../commands/add-group.command";
import { KeycloakManager } from "../../../../utils/keycloak/keycloak-manager";

export interface AddGroupHandlerProps {
  keycloakManager: KeycloakManager;
}

export default class AddGroupHandler implements CommandHandler<AddGroupCommand> {
  public commandType: string = ADD_GROUP_COMMAND_TYPE;

  constructor(private dependencies: AddGroupHandlerProps) {}

  async execute(command: AddGroupCommand) {
    const { keycloakManager } = this.dependencies;

    return keycloakManager.addGroup(command.payload.name);
  }
}

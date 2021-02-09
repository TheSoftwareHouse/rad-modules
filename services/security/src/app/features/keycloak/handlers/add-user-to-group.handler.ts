import { CommandHandler } from "@tshio/command-bus";
import { ADD_USER_TO_GROUP_COMMAND_TYPE, AddUserToGroupCommand } from "../commands/add-user-to-group.command";
import { KeycloakManager } from "../../../../utils/keycloak/keycloak-manager";

export interface AddUserToGroupHandlerProps {
  keycloakManager: KeycloakManager;
}

export default class AddUserToGroupHandler implements CommandHandler<AddUserToGroupCommand> {
  public commandType: string = ADD_USER_TO_GROUP_COMMAND_TYPE;

  constructor(private dependencies: AddUserToGroupHandlerProps) {}

  async execute(command: AddUserToGroupCommand) {
    const { keycloakManager } = this.dependencies;

    return keycloakManager.addUserToGroup(command.payload.username, command.payload.group);
  }
}

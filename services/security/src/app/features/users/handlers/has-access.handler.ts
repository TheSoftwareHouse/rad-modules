import { Handler } from "../../../../../../../shared/command-bus";
import { HAS_ACCESS_COMMAND_TYPE, HasAccessCommand } from "../commands/has-access.command";
import { AuthorizationClient } from "../../../../ACL/authorization-client.types";

export interface HasAccessHandlerProps {
  authorizationClient: AuthorizationClient;
}

export default class HasAccessHandler implements Handler<HasAccessCommand> {
  public commandType: string = HAS_ACCESS_COMMAND_TYPE;

  constructor(private dependencies: HasAccessHandlerProps) {}

  async execute(command: HasAccessCommand) {
    const { authorizationClient } = this.dependencies;
    const { accessToken, resource } = command.payload;
    const hasAccess = await authorizationClient.hasAccess(accessToken.getToken(), resource);

    return {
      hasAccess,
    };
  }
}

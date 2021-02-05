import { CommandHandler } from "@tshio/command-bus";
import { ME_COMMAND_TYPE, MeCommand } from "../commands/me.command";
import { Logger } from "@tshio/logger";
import { AuthorizationClient } from "../../../../ACL/authorization-client.types";

interface MeHandlerProps {
  authorizationClient: AuthorizationClient;
  logger: Logger;
}

export default class MeHandler implements CommandHandler<MeCommand> {
  public commandType: string = ME_COMMAND_TYPE;

  constructor(private dependencies: MeHandlerProps) {}

  async execute(command: MeCommand) {
    const { authorizationClient } = this.dependencies;

    const { accessToken } = command.payload;

    const userInfo = await authorizationClient.getTokenInfo(accessToken);

    return userInfo;
  }
}

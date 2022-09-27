import { CommandHandler } from "@tshio/command-bus";
import { LOGOUT_COMMAND_TYPE, LogoutCommand } from "../commands/logout.command";
import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";

export interface LogoutHandlerProps {
  authenticationClient: AuthenticationClient;
}

export default class LoginHandler implements CommandHandler<LogoutCommand> {
  public commandType: string = LOGOUT_COMMAND_TYPE;

  constructor(private dependencies: LogoutHandlerProps) {}

  async execute(command: LogoutCommand) {
    const { refreshToken } = command.payload;
    await this.dependencies.authenticationClient.logout(refreshToken);
  }
}

import { CommandHandler } from "@tshio/command-bus";
import { LOGIN_COMMAND_TYPE, LoginCommand } from "../commands/login.command";
import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";

export interface LoginHandlerProps {
  authenticationClient: AuthenticationClient;
}

export default class LoginHandler implements CommandHandler<LoginCommand> {
  public commandType: string = LOGIN_COMMAND_TYPE;

  constructor(private dependencies: LoginHandlerProps) {}

  async execute(command: LoginCommand) {
    const { username, password } = command.payload;
    const { accessToken, refreshToken } = await this.dependencies.authenticationClient.login(username, password);

    return {
      accessToken,
      refreshToken,
    };
  }
}

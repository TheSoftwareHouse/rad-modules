import { CommandHandler } from "@tshio/command-bus";
import { REFRESH_TOKEN_COMMAND_TYPE, RefreshTokenCommand } from "../commands/refresh-token.command";
import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";

export interface RefreshTokenHandlerProps {
  authenticationClient: AuthenticationClient;
}

export default class RefreshTokenHandler implements CommandHandler<RefreshTokenCommand> {
  public commandType: string = REFRESH_TOKEN_COMMAND_TYPE;

  constructor(private dependencies: RefreshTokenHandlerProps) {}

  async execute(command: RefreshTokenCommand) {
    const { accessToken, refreshToken } = await this.dependencies.authenticationClient.refreshToken(
      command.payload.accessToken,
      command.payload.refreshToken,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}

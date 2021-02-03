import { CommandHandler } from "@tshio/command-bus";
import { IS_AUTHENTICATED_COMMAND_TYPE, IsAuthenticatedCommand } from "../commands/is-authenticated.command";
import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";
import { Logger } from "winston";

export interface IsAuthenticatedHandlerProps {
  secret: string;
  authenticationClient: AuthenticationClient;
  logger: Logger;
}

export default class IsAuthenticatedHandler implements CommandHandler<IsAuthenticatedCommand> {
  public commandType: string = IS_AUTHENTICATED_COMMAND_TYPE;

  constructor(private dependencies: IsAuthenticatedHandlerProps) {}

  async execute(command: IsAuthenticatedCommand) {
    const { authenticationClient, logger } = this.dependencies;
    try {
      const token = command.payload.accessToken.getToken();
      const isAuthenticated = await authenticationClient.isAuthenticated(token);

      return {
        isAuthenticated,
      };
    } catch (error) {
      logger.error("error when decoding a token: ", error);
    }

    return {
      isAuthenticated: false,
    };
  }
}

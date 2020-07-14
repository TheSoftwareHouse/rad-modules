import { Handler } from "../../../../../../../shared/command-bus";
import {
  LOGIN_GOOGLE_ID_TOKEN_COMMAND_TYPE,
  LoginGoogleIdTokenCommand,
} from "../commands/login-google-id-token.command";
import { OauthFirstLogin } from "../../../../config/config";
import { GoogleClient } from "../../users/oauth/google/google-client";
import { AuthenticationClient } from "../../users/strategies/authentication/authentication-client.types";
import { Logger } from "winston";
import { UsersService } from "../../users/services/users-service";

interface LoginGoogleIdTokenHandlerProps {
  googleClient: GoogleClient;
  oauthFirstLogin: OauthFirstLogin;
  authenticationClient: AuthenticationClient;
  logger: Logger;
  usersService: UsersService;
}

export default class LoginGoogleIdTokenHandler implements Handler<LoginGoogleIdTokenCommand> {
  public commandType: string = LOGIN_GOOGLE_ID_TOKEN_COMMAND_TYPE;

  constructor(private dependencies: LoginGoogleIdTokenHandlerProps) {}

  async execute(command: LoginGoogleIdTokenCommand) {
    const { authenticationClient, oauthFirstLogin, usersService, googleClient } = this.dependencies;
    const { idToken } = command.payload;

    const oauthUser = await googleClient.loginWithToken({ idToken });

    const userNameExists = await usersService.userNameExists(oauthUser.email);

    if (!userNameExists && oauthFirstLogin.createUserAccount) {
      const user = await usersService.createOauthUser(oauthUser.email);
      await usersService.addAttributes(user, oauthFirstLogin.defaultAttributes);
    }

    const { accessToken, refreshToken } = await authenticationClient.loginWithoutPassword(oauthUser.email);

    return {
      accessToken,
      refreshToken,
      username: oauthUser.email,
    };
  }
}

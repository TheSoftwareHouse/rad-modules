import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";
import { Handler } from "../../../../../../../shared/command-bus";
import { OAUTH_REDIRECT_COMMAND_TYPE, OauthRedirectCommand } from "../commands/oauth-redirect.command";
import { Logger } from "winston";
import { OauthFirstLogin, OauthProvider } from "../../../../config/config";
import { UsersService } from "../services/users-service";
import { GoogleClient } from "../oauth/google/google-client";
import { FacebookClient } from "../oauth/facebook/facebook-client";
import { OAuthClient } from "../oauth/client.types";
import { MicrosoftClient } from "../oauth/microsoft/microsoft-client";

interface OauthRedirectHandlerProps {
  googleClient: GoogleClient;
  facebookClient: FacebookClient;
  microsoftClient: MicrosoftClient;
  oauthFirstLogin: OauthFirstLogin;
  authenticationClient: AuthenticationClient;
  logger: Logger;
  usersService: UsersService;
}

export default class OauthRedirectHandler implements Handler<OauthRedirectCommand> {
  public commandType: string = OAUTH_REDIRECT_COMMAND_TYPE;

  constructor(private dependencies: OauthRedirectHandlerProps) {}

  async execute(command: OauthRedirectCommand) {
    const {
      authenticationClient,
      oauthFirstLogin,
      usersService,
      googleClient,
      facebookClient,
      microsoftClient,
    } = this.dependencies;
    const { code, redirectUrl, provider } = command.payload as any;

    const providers: any = {
      google: googleClient,
      facebook: facebookClient,
      microsoft: microsoftClient,
    };

    const oauthProvider = providers[provider ?? OauthProvider.GOOGLE] as OAuthClient;

    const oauthUser = await oauthProvider.login({ code, redirectUrl });

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

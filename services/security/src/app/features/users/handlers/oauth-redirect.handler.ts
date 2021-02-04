import { CommandHandler } from "@tshio/command-bus";
import { Logger } from "winston";
import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";
import { OAUTH_REDIRECT_COMMAND_TYPE, OauthRedirectCommand } from "../commands/oauth-redirect.command";
import { AuthenticationStrategy, OauthFirstLogin, OauthProvider } from "../../../../config/config";
import { UsersService } from "../services/users-service";
import { GoogleClient } from "../oauth/google/google-client";
import { FacebookClient } from "../oauth/facebook/facebook-client";
import { OAuthClient } from "../oauth/client.types";
import { MicrosoftClient } from "../oauth/microsoft/microsoft-client";
import { KeycloakClient } from "../oauth/keycloak/keycloak-client";

interface OauthRedirectHandlerProps {
  googleClient: GoogleClient;
  facebookClient: FacebookClient;
  microsoftClient: MicrosoftClient;
  keycloakClient: KeycloakClient;
  oauthFirstLogin: OauthFirstLogin;
  authenticationClient: AuthenticationClient;
  logger: Logger;
  usersService: UsersService;
  authenticationStrategy: AuthenticationStrategy;
}

export default class OauthRedirectHandler implements CommandHandler<OauthRedirectCommand> {
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
      keycloakClient,
      authenticationStrategy,
    } = this.dependencies;
    const { code, redirectUrl, provider } = command.payload as any;

    const providers: any = {
      google: googleClient,
      facebook: facebookClient,
      microsoft: microsoftClient,
      keycloak: keycloakClient,
    };

    if (provider === OauthProvider.KEYCLOAK && authenticationStrategy === AuthenticationStrategy.Keycloak) {
      const tokens = await keycloakClient.login({ code, redirectUrl });

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        username: tokens.email,
      };
    }

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

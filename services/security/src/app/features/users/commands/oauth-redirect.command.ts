import { Command } from "@tshio/command-bus";
import { OauthProvider } from "../../../../config/oauth.config";

export const OAUTH_REDIRECT_COMMAND_TYPE = "users/OAUTHREDIRECT";

export interface OauthRedirectCommandPayload {
  provider: OauthProvider;
  code: string;
  redirectUrl: string;
}

export class OauthRedirectCommand implements Command<OauthRedirectCommandPayload> {
  public type: string = OAUTH_REDIRECT_COMMAND_TYPE;

  constructor(public payload: OauthRedirectCommandPayload) {}
}

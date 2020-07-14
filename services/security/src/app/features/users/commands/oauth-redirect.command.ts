import { Command } from "../../../../../../../shared/command-bus";

export const OAUTH_REDIRECT_COMMAND_TYPE = "users/OAUTHREDIRECT";

export interface OauthRedirectCommandPayload {
  provider: string;
  code: string;
  redirectUrl: string;
}

export class OauthRedirectCommand implements Command<OauthRedirectCommandPayload> {
  public type: string = OAUTH_REDIRECT_COMMAND_TYPE;

  constructor(public payload: OauthRedirectCommandPayload) {}
}

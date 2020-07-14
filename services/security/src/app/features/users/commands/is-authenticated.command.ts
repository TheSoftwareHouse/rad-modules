import { BearerToken } from "../../../../tokens/bearer-token";
import { Command } from "../../../../../../../shared/command-bus";

export const IS_AUTHENTICATED_COMMAND_TYPE = "users/ISAUTHENTICATED";

export interface IsAuthenticatedCommandPayload {
  accessToken: BearerToken;
}

export class IsAuthenticatedCommand implements Command<IsAuthenticatedCommandPayload> {
  public type: string = IS_AUTHENTICATED_COMMAND_TYPE;

  constructor(public payload: IsAuthenticatedCommandPayload) {}
}

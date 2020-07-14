import { Command } from "../../../../../../../shared/command-bus";

export const REFRESH_TOKEN_COMMAND_TYPE = "users/REFRESHTOKEN";

export interface RefreshTokenCommandPayload {
  refreshToken: string;
  accessToken: string;
}

export class RefreshTokenCommand implements Command<RefreshTokenCommandPayload> {
  public type: string = REFRESH_TOKEN_COMMAND_TYPE;

  constructor(public payload: RefreshTokenCommandPayload) {}
}

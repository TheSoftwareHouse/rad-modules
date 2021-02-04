import { Command } from "@tshio/command-bus";

export const REFRESH_USER_ACTIVE_TOKEN_COMMAND_TYPE = "users/REFRESHUSERACTIVETOKEN";

export interface RefreshUserActiveTokenCommandPayload {
  userId: string;
}

export class RefreshUserActiveTokenCommand implements Command<RefreshUserActiveTokenCommandPayload> {
  public type: string = REFRESH_USER_ACTIVE_TOKEN_COMMAND_TYPE;

  constructor(public payload: RefreshUserActiveTokenCommandPayload) {}
}

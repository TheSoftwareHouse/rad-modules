import { Command } from "@tshio/command-bus";

export const LOGOUT_COMMAND_TYPE = "users/LOGOUT";

export interface LogoutCommandPayload {
  refreshToken: string;
}

export class LogoutCommand implements Command<LogoutCommandPayload> {
  public type: string = LOGOUT_COMMAND_TYPE;

  constructor(public payload: LogoutCommandPayload) {}
}

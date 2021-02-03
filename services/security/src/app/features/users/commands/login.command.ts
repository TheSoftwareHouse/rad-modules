import { Command } from "@tshio/command-bus";

export const LOGIN_COMMAND_TYPE = "users/LOGIN";

export interface LoginCommandPayload {
  username: string;
  password: string;
}

export class LoginCommand implements Command<LoginCommandPayload> {
  public type: string = LOGIN_COMMAND_TYPE;

  constructor(public payload: LoginCommandPayload) {}
}

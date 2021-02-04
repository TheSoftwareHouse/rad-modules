import { Command } from "@tshio/command-bus";

export const LOGIN_GOOGLE_ID_TOKEN_COMMAND_TYPE = "public/LOGINGOOGLEIDTOKEN";

export interface LoginGoogleIdTokenCommandPayload {
  idToken: string;
}

export class LoginGoogleIdTokenCommand implements Command<LoginGoogleIdTokenCommandPayload> {
  public type: string = LOGIN_GOOGLE_ID_TOKEN_COMMAND_TYPE;

  constructor(public payload: LoginGoogleIdTokenCommandPayload) {}
}

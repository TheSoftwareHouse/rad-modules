import { Command } from "@tshio/command-bus";

export const PASSWORD_RESET_TOKEN_COMMAND_TYPE = "public/PASSWORDRESETTOKEN";

export interface PasswordResetTokenCommandPayload {
  username: string;
}

export class PasswordResetTokenCommand implements Command<PasswordResetTokenCommandPayload> {
  public type: string = PASSWORD_RESET_TOKEN_COMMAND_TYPE;

  constructor(public payload: PasswordResetTokenCommandPayload) {}
}

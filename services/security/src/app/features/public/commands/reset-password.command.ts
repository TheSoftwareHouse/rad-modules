import { Command } from "@tshio/command-bus";

export const RESET_PASSWORD_COMMAND_TYPE = "public/RESETPASSWORD";

export interface ResetPasswordCommandPayload {
  newPassword?: string;
  resetPasswordToken: string;
}

export class ResetPasswordCommand implements Command<ResetPasswordCommandPayload> {
  public type: string = RESET_PASSWORD_COMMAND_TYPE;

  constructor(public payload: ResetPasswordCommandPayload) {}
}

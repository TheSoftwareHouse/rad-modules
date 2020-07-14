import { Command } from "../../../../../../../shared/command-bus";

export const SET_PASSWORD_COMMAND_TYPE = "users/SETPASSWORD";

export interface SetPasswordCommandPayload {
  newPassword: string;
  oldPassword?: string;
  usernameWhomAdminChangePassword?: string;
  usernameToSelfPasswordChange?: string;
  isSuperAdmin: boolean;
}

export class SetPasswordCommand implements Command<SetPasswordCommandPayload> {
  public type: string = SET_PASSWORD_COMMAND_TYPE;

  constructor(public payload: SetPasswordCommandPayload) {}
}

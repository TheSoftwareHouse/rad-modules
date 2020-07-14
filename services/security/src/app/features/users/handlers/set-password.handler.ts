import { Handler } from "../../../../../../../shared/command-bus";
import { SET_PASSWORD_COMMAND_TYPE, SetPasswordCommand } from "../commands/set-password.command";
import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";

export interface SetPasswordProps {
  authenticationClient: AuthenticationClient;
}

export default class SetPasswordHandler implements Handler<SetPasswordCommand> {
  public commandType: string = SET_PASSWORD_COMMAND_TYPE;

  constructor(private dependencies: SetPasswordProps) {}

  async execute(command: SetPasswordCommand) {
    const { authenticationClient } = this.dependencies;
    const {
      oldPassword = "",
      newPassword,
      usernameWhomAdminChangePassword,
      usernameToSelfPasswordChange = "",
      isSuperAdmin,
    } = command.payload;
    let passwordChanged = true;

    try {
      if (isSuperAdmin && usernameWhomAdminChangePassword) {
        await authenticationClient.resetPassword(usernameWhomAdminChangePassword, newPassword);
      } else {
        await authenticationClient.setNewPassword(usernameToSelfPasswordChange, oldPassword, newPassword);
      }
    } catch (err) {
      passwordChanged = false;
      throw err;
    }

    // TODO: always true??????
    return {
      passwordChanged,
    };
  }
}

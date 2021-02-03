import { CommandHandler } from "@tshio/command-bus";
import { RESET_PASSWORD_COMMAND_TYPE, ResetPasswordCommand } from "../commands/reset-password.command";
import * as RandExp from "randexp";
import { AuthenticationClient } from "../strategies/authentication/authentication-client.types";
import { Mailer } from "../../../../utils/mailer/mailer";
import { Logger } from "winston";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";

export interface ResetPasswordProps {
  authenticationClient: AuthenticationClient;
  usersRepository: UsersRepository;
  passwordGenerator: RandExp;
  mailer: Mailer;
  logger: Logger;
  userPasswordIsRandom: boolean;
}

type ResetPasswordResponse = {
  newPassword: string;
};

export default class ResetPasswordHandler implements CommandHandler<ResetPasswordCommand> {
  public commandType: string = RESET_PASSWORD_COMMAND_TYPE;

  constructor(private dependencies: ResetPasswordProps) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResponse | undefined> {
    const { resetPasswordToken, newPassword } = command.payload;
    const {
      usersRepository,
      authenticationClient,
      passwordGenerator,
      mailer,
      logger,
      userPasswordIsRandom,
    } = this.dependencies;

    const password = newPassword || passwordGenerator.gen();

    const user = await usersRepository.findUserByResetPasswordToken(resetPasswordToken);

    if (!user) {
      throw new NotFoundError("Wrong reset token");
    }

    const { username } = user;
    await authenticationClient.resetPassword(username, password);

    if (userPasswordIsRandom) {
      mailer
        .sendResetPassword(username, username, password)
        .catch((error) => logger.error(error instanceof Error ? error.message : "Unknown error while sending email"));

      return { newPassword: password };
    }

    return undefined;
  }
}

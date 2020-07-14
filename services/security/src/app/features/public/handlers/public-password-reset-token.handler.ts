import { Handler } from "../../../../../../../shared/command-bus";
import { PASSWORD_RESET_TOKEN_COMMAND_TYPE, PasswordResetTokenCommand } from "../commands/password-reset-token.command";
import { UsersService } from "../../users/services/users-service";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { Mailer } from "../../../../utils/mailer/mailer";
import { Logger } from "winston";

interface PasswordResetTokenProps {
  usersService: UsersService;
  usersRepository: UsersRepository;
  mailer: Mailer;
  logger: Logger;
}

export default class PasswordResetTokenHandler implements Handler<PasswordResetTokenCommand> {
  public commandType: string = PASSWORD_RESET_TOKEN_COMMAND_TYPE;

  constructor(private dependencies: PasswordResetTokenProps) {}

  async execute(command: PasswordResetTokenCommand) {
    const { usersService, usersRepository, mailer, logger } = this.dependencies;
    const { username } = command.payload;

    const user = await usersRepository.findByUsername(username);

    if (!user) {
      return undefined;
    }

    const resetPasswordToken = usersService.generateResetPasswordToken(username);

    user.resetPasswordToken = resetPasswordToken;
    await usersRepository.save(user);

    mailer
      .sendResetPasswordToken(username, resetPasswordToken)
      .catch((error) => logger.error(error instanceof Error ? error.message : "Unknown error while sending email"));

    return undefined;
  }
}

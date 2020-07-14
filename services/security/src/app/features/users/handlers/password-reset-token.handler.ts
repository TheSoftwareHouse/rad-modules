import { Handler } from "../../../../../../../shared/command-bus";
import { PASSWORD_RESET_TOKEN_COMMAND_TYPE, PasswordResetTokenCommand } from "../commands/password-reset-token.command";
import { UsersService } from "../services/users-service";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";

interface PasswordResetTokenProps {
  usersService: UsersService;
  usersRepository: UsersRepository;
}

export default class PasswordResetTokenHandler implements Handler<PasswordResetTokenCommand> {
  public commandType: string = PASSWORD_RESET_TOKEN_COMMAND_TYPE;

  constructor(private dependencies: PasswordResetTokenProps) {}

  async execute(command: PasswordResetTokenCommand) {
    const { usersService, usersRepository } = this.dependencies;
    const { username } = command.payload;

    const user = await usersRepository.findByUsername(username);

    if (!user) {
      throw new NotFoundError("Wrong username.");
    }

    const resetPasswordToken = usersService.generateResetPasswordToken(username);

    user.resetPasswordToken = resetPasswordToken;
    await usersRepository.save(user);

    return { resetPasswordToken };
  }
}

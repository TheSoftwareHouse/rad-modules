import { Handler } from "../../../../../../../shared/command-bus";
import { ACTIVATE_USER_COMMAND_TYPE, ActivateUserCommand } from "../commands/activate-user.command";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { NoLongerAvailableError } from "../../../../errors/no-longer-available.error";
import { ActivationTokenUtils } from "../../../../tokens/activation-token-utils";

export interface ActiveUserHandlerProps {
  usersRepository: UsersRepository;
  activationTokenUtils: ActivationTokenUtils;
}

export default class ActiveUserHandler implements Handler<ActivateUserCommand> {
  public commandType: string = ACTIVATE_USER_COMMAND_TYPE;

  constructor(private dependencies: ActiveUserHandlerProps) {}

  async execute(command: ActivateUserCommand) {
    const { activationToken } = command.payload;
    const { usersRepository, activationTokenUtils } = this.dependencies;

    const user = await usersRepository.findByActivationToken(activationToken);

    if (!user) {
      throw new NotFoundError("Wrong activation token");
    }

    if (activationTokenUtils.isTokenExpired(user.activationTokenExpireDate)) {
      throw new NoLongerAvailableError("Token expired.");
    }

    user.isActive = true;
    user.deactivationDate = null;
    user.activationToken = null;
    user.activationTokenExpireDate = null;

    await usersRepository.save(user);

    return {
      userId: user.id,
      isActive: user.isActive,
    };
  }
}

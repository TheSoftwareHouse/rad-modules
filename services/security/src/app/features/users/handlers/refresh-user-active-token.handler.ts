import { Handler } from "../../../../../../../shared/command-bus";
import {
  REFRESH_USER_ACTIVE_TOKEN_COMMAND_TYPE,
  RefreshUserActiveTokenCommand,
} from "../commands/refresh-user-active-token.command";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { ForbiddenError } from "../../../../errors/forbidden.error";
import { ActivationTokenUtils } from "../../../../tokens/activation-token-utils";

export interface RefreshUserActiveTokenHandlerProps {
  usersRepository: UsersRepository;
  activationTokenUtils: ActivationTokenUtils;
}

export default class RefreshUserActiveTokenHandler implements Handler<RefreshUserActiveTokenCommand> {
  public commandType: string = REFRESH_USER_ACTIVE_TOKEN_COMMAND_TYPE;

  constructor(private dependencies: RefreshUserActiveTokenHandlerProps) {}

  async execute(command: RefreshUserActiveTokenCommand) {
    const { userId } = command.payload;
    const { usersRepository, activationTokenUtils } = this.dependencies;
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not exists.");
    }

    if (user.isActive) {
      throw new ForbiddenError("User is already active.");
    }

    user.activationToken = activationTokenUtils.getActivationToken(user.username);
    user.activationTokenExpireDate = activationTokenUtils.getActivationTokenExpireDate();
    user.isActive = false;
    await usersRepository.save(user);

    return {
      userId: user.id,
      isActive: user.isActive,
      activationToken: user.activationToken,
    };
  }
}

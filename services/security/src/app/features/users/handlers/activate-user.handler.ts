import { Handler } from "../../../../../../../shared/command-bus";
import { ACTIVATE_USER_COMMAND_TYPE, ActivateUserCommand } from "../commands/activate-user.command";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { NoLongerAvailableError } from "../../../../errors/no-longer-available.error";
import { ActivationTokenUtils } from "../../../../tokens/activation-token-utils";
import { EventDispatcher } from "../../../../shared/event-dispatcher";

export interface ActiveUserHandlerProps {
  usersRepository: UsersRepository;
  activationTokenUtils: ActivationTokenUtils;
  eventDispatcher: EventDispatcher;
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

    const savedUser = await usersRepository.save(user);
    await this.dependencies.eventDispatcher.dispatch({
      name: "UserActivated",
      payload: {
        userId: savedUser.id,
        attributes: savedUser.attributes.map((attribute) => {
          return {
            id: attribute.id,
            name: attribute.name,
          };
        }),
      },
    });

    return {
      userId: user.id,
      isActive: user.isActive,
    };
  }
}

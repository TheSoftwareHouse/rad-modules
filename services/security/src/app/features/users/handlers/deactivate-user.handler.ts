import { Handler } from "../../../../../../../shared/command-bus";
import { DEACTIVATE_USER_COMMAND_TYPE, DeactivateUserCommand } from "../commands/deactivate-user.command";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { ActivationTokenUtils } from "../../../../tokens/activation-token-utils";
import { ConflictError } from "../../../../errors/conflict.error";
import { SuperAdminConfig } from "../../../../config/config";
import { EventDispatcher } from "../../../../shared/event-dispatcher";

export interface DeactivateUserHandlerProps {
  usersRepository: UsersRepository;
  activationTokenUtils: ActivationTokenUtils;
  superAdminUser: SuperAdminConfig;
  eventDispatcher: EventDispatcher;
}

export default class DeactivateUserHandler implements Handler<DeactivateUserCommand> {
  public commandType: string = DEACTIVATE_USER_COMMAND_TYPE;

  constructor(private dependencies: DeactivateUserHandlerProps) {}

  async execute(command: DeactivateUserCommand) {
    const { userId } = command.payload;
    const { usersRepository, activationTokenUtils, superAdminUser } = this.dependencies;
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User not exists.");
    }

    if (user.username === superAdminUser.username) {
      throw new ConflictError("Cannot deactivate the system administrator account.");
    }

    user.isActive = false;
    user.deactivationDate = new Date();
    user.activationToken = activationTokenUtils.getActivationToken(user.username, true);
    user.activationTokenExpireDate = activationTokenUtils.getActivationTokenExpireDate(true);
    await usersRepository.save(user);

    await this.dependencies.eventDispatcher.dispatch({
      name: "UserDeactivated",
      payload: {
        userId: user.id,
        attributes: user.attributes.map((attribute) => {
          return {
            attributeId: attribute.id,
            attributeName: attribute.name,
          };
        }),
      },
    });

    return {
      userId: user.id,
      isActive: user.isActive,
      deactivationDate: user.deactivationDate,
    };
  }
}

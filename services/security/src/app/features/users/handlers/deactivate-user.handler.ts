import { CommandHandler } from "@tshio/command-bus";
import { DEACTIVATE_USER_COMMAND_TYPE, DeactivateUserCommand } from "../commands/deactivate-user.command";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { ActivationTokenUtils } from "../../../../tokens/activation-token-utils";
import { ConflictError } from "../../../../errors/conflict.error";
import { SuperAdminConfig } from "../../../../config/config";
import { EventDispatcher } from "../../../../shared/event-dispatcher";
import { UserDeactivatedEvent } from "../subscribers/events/user-deactivated.event";

export interface DeactivateUserHandlerProps {
  usersRepository: UsersRepository;
  activationTokenUtils: ActivationTokenUtils;
  superAdminUser: SuperAdminConfig;
  eventDispatcher: EventDispatcher;
}

export default class DeactivateUserHandler implements CommandHandler<DeactivateUserCommand> {
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

    await this.dependencies.eventDispatcher.dispatch(
      new UserDeactivatedEvent({
        userId: user.id!,
        attributes: user.attributes.map((attribute) => {
          return {
            id: attribute.id!,
            name: attribute.name,
          };
        }),
      }),
    );

    return {
      userId: user.id,
      isActive: user.isActive,
      deactivationDate: user.deactivationDate,
    };
  }
}

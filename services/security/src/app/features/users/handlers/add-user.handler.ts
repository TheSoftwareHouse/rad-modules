import { UsersRepository } from "../../../../repositories/users.repostiory";
import { CommandHandler } from "@tshio/command-bus";
import { ADD_USER_COMMAND_TYPE, AddUserCommand } from "../commands/add-user.command";
import { Mailer } from "../../../../utils/mailer/mailer";
import { Logger } from "winston";
import { UsersService } from "../services/users-service";
import { EventDispatcher } from "../../../../shared/event-dispatcher";
import { UserAddedEvent } from "../subscribers/events/user-added.event";

export interface AddUserHandlerProps {
  usersRepository: UsersRepository;
  usersService: UsersService;
  mailer: Mailer;
  logger: Logger;
  eventDispatcher: EventDispatcher;
}

export default class AddUserHandler implements CommandHandler<AddUserCommand> {
  public commandType: string = ADD_USER_COMMAND_TYPE;

  constructor(private dependencies: AddUserHandlerProps) {}

  async execute(command: AddUserCommand) {
    const { usersRepository, usersService, mailer, logger } = this.dependencies;
    const { username, password, attributes } = command.payload;

    let newUser = await usersService.createNormalUser(username, password);
    if (attributes?.length) {
      await usersService.addAttributes(newUser, attributes);
      // need to reload user object in order to have attribute.id
      newUser = (await usersRepository.findById(newUser.id!))!;
    }
    mailer
      .sendCreateUser(username, username, username)
      .catch((error) => logger.error(error instanceof Error ? error.message : "Unknown error while sending email"));
    await this.dependencies.eventDispatcher.dispatch(
      new UserAddedEvent({
        userId: newUser.id!,
        attributes: newUser.attributes?.map((attribute) => {
          return {
            id: attribute.id!,
            name: attribute.name,
          };
        }),
      }),
    );
    return {
      newUserId: newUser.id,
    };
  }
}

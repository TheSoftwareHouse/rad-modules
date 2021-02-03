import { CommandHandler } from "@tshio/command-bus";
import { ADD_ATTRIBUTE_COMMAND_TYPE, AddAttributeCommand } from "../commands/add-attribute.command";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { UsersService } from "../services/users-service";
import { EventDispatcher } from "../../../../shared/event-dispatcher";
import { UserAttributeAddedEvent } from "../subscribers/events/user-attribute-added.event";

export interface AddAttributeHandlerProps {
  usersRepository: UsersRepository;
  usersService: UsersService;
  eventDispatcher: EventDispatcher;
}

export default class AddAttributeHandler implements CommandHandler<AddAttributeCommand> {
  public commandType: string = ADD_ATTRIBUTE_COMMAND_TYPE;

  constructor(private dependencies: AddAttributeHandlerProps) {}

  async execute(command: AddAttributeCommand) {
    const { usersRepository, usersService } = this.dependencies;
    const { attributes, userId } = command.payload;

    const user = await usersRepository.findByIdWithoutAttributes(userId);

    if (!user) {
      throw new NotFoundError(`User with id ${userId} doesn't exist.`);
    }

    const savedUser = await usersService.addAttributes(user, attributes);

    if (!savedUser) {
      throw new NotFoundError(`User with id ${userId} doesn't exist.`);
    }

    await this.dependencies.eventDispatcher.dispatch(
      new UserAttributeAddedEvent({
        userId: savedUser.id!,
        attributes: savedUser.attributes.map((attribute) => {
          return {
            id: attribute.id!,
            name: attribute.name,
          };
        }),
      }),
    );
  }
}

import { CommandHandler } from "@tshio/command-bus";
import { NotFoundError } from "../../../../errors/not-found.error";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { REMOVE_ATTRIBUTE_COMMAND_TYPE, RemoveAttributeCommand } from "../commands/remove-attribute.command";
import { AttributesRepository } from "../../../../repositories/attributes.repostiory";
import { EventDispatcher } from "../../../../shared/event-dispatcher";
import { UserAttributeRemovedEvent } from "../subscribers/events/user-attribute-removed.event";

export interface RemoveAttributeHandlerProps {
  usersRepository: UsersRepository;
  attributesRepository: AttributesRepository;
  eventDispatcher: EventDispatcher;
}

export default class RemoveAttributeHandler implements CommandHandler<RemoveAttributeCommand> {
  public commandType: string = REMOVE_ATTRIBUTE_COMMAND_TYPE;

  constructor(private dependencies: RemoveAttributeHandlerProps) {}

  async execute(command: RemoveAttributeCommand) {
    const { attributesRepository, usersRepository } = this.dependencies;
    const { attributes, userId } = command.payload;

    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`User with id ${userId} doesn't exist.`);
    }

    const userAttributeNames = user.attributes.map((attribute) => attribute.name);
    const notExistsAttributes = attributes.filter((attribute) => !userAttributeNames.includes(attribute));

    if (notExistsAttributes.length) {
      throw new NotFoundError(`User has not attributes: ${notExistsAttributes.join(", ")}`);
    }

    const attributesIds = user.attributes
      .filter((attribute) => attributes.includes(attribute.name))
      .map((attribute) => attribute.id);

    user.attributes = user.attributes.filter((attr) => !attributes.includes(attr.name));

    await attributesRepository.delete(attributesIds as string[]);
    await this.dependencies.eventDispatcher.dispatch(
      new UserAttributeRemovedEvent({
        userId: user.id!,
        attributes: user.attributes.map((attribute) => {
          return {
            id: attribute.id!,
            name: attribute.name,
          };
        }),
      }),
    );
  }
}

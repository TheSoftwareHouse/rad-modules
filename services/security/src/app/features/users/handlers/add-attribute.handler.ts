import { Handler } from "../../../../../../../shared/command-bus";
import { ADD_ATTRIBUTE_COMMAND_TYPE, AddAttributeCommand } from "../commands/add-attribute.command";
import { UsersRepository } from "../../../../repositories/users.repostiory";
import { NotFoundError } from "../../../../errors/not-found.error";
import { UsersService } from "../services/users-service";

export interface AddAttributeHandlerProps {
  usersRepository: UsersRepository;
  usersService: UsersService;
}

export default class AddAttributeHandler implements Handler<AddAttributeCommand> {
  public commandType: string = ADD_ATTRIBUTE_COMMAND_TYPE;

  constructor(private dependencies: AddAttributeHandlerProps) {}

  async execute(command: AddAttributeCommand) {
    const { usersRepository, usersService } = this.dependencies;
    const { attributes, userId } = command.payload;

    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError(`User with id ${userId} doesn't exist.`);
    }

    await usersService.addAttributes(user, attributes);
  }
}

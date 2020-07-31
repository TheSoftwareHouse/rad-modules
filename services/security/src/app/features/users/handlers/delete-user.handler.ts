import { Handler } from "../../../../../../../shared/command-bus";
import { DELETE_USER_COMMAND_TYPE, DeleteUserCommand } from "../commands/delete-user.command";
import { UsersService } from "../services/users-service";
import { EventDispatcher } from "../../../../shared/event-dispatcher";
import { UsersRepository } from "../../../../repositories/users.repostiory";

export interface DeleteUserHandlerProps {
  usersService: UsersService;
  usersRepository: UsersRepository;
  eventDispatcher: EventDispatcher;
}

export default class DeleteUserHandler implements Handler<DeleteUserCommand> {
  public commandType: string = DELETE_USER_COMMAND_TYPE;

  constructor(private dependencies: DeleteUserHandlerProps) {}

  async execute(command: DeleteUserCommand) {
    const { usersService, usersRepository } = this.dependencies;
    const { userId } = command.payload;
    // we need user object to put is in dispather
    const user = await usersRepository.findById(userId)!;
    await usersService.deleteUser(userId);
    await this.dependencies.eventDispatcher.dispatch({
      name: "UserRemoved",
      payload: {
        userId: user!.id,
        attributes: user!.attributes.map((attribute) => {
          return {
            id: attribute.id,
            name: attribute.name,
          };
        }),
      },
    });
  }
}

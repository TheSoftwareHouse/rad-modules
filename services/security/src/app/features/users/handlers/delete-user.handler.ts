import { Handler } from "../../../../../../../shared/command-bus";
import { DELETE_USER_COMMAND_TYPE, DeleteUserCommand } from "../commands/delete-user.command";
import { UsersService } from "../services/users-service";
import { EventDispatcher } from "../../../../shared/event-dispatcher";

export interface DeleteUserHandlerProps {
  usersService: UsersService;
  eventDispatcher: EventDispatcher;
}

export default class DeleteUserHandler implements Handler<DeleteUserCommand> {
  public commandType: string = DELETE_USER_COMMAND_TYPE;

  constructor(private dependencies: DeleteUserHandlerProps) {}

  async execute(command: DeleteUserCommand) {
    const { usersService } = this.dependencies;
    const { userId } = command.payload;
    await usersService.deleteUser(userId);
    await this.dependencies.eventDispatcher.dispatch({
      name: "UserRemoved",
      payload: userId,
    });
  }
}

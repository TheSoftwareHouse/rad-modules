import { CommandHandler } from "@tshio/command-bus";
import { GET_USER_COMMAND_TYPE, GetUserCommand } from "../commands/get-user.command";
import { UsersService } from "../services/users-service";

export interface GetUserHandlerProps {
  usersService: UsersService;
}

export default class GetUserHandler implements CommandHandler<GetUserCommand> {
  public commandType: string = GET_USER_COMMAND_TYPE;

  constructor(private dependencies: GetUserHandlerProps) {}

  async execute(command: GetUserCommand) {
    const { usersService } = this.dependencies;
    const { userId, isSuperAdmin } = command.payload;

    return usersService.getUser(userId, isSuperAdmin);
  }
}

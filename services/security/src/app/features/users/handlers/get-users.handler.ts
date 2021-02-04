import { CommandHandler } from "@tshio/command-bus";
import { GET_USERS_COMMAND_TYPE, GetUsersCommand } from "../commands/get-users.command";
import { UsersResponse, UsersService } from "../services/users-service";

export interface GetUsersHandlerProps {
  usersService: UsersService;
}

export default class GetUsersHandler implements CommandHandler<GetUsersCommand> {
  public commandType: string = GET_USERS_COMMAND_TYPE;

  constructor(private dependencies: GetUsersHandlerProps) {}

  async execute(command: GetUsersCommand): Promise<UsersResponse> {
    const { usersService } = this.dependencies;

    return usersService.getUsers(command.payload);
  }
}

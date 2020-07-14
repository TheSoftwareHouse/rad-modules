import { Handler } from "../../../../../../../shared/command-bus";
import {
  GET_USERS_BY_RESOURCE_COMMAND_TYPE,
  GetUsersByResourceCommand,
} from "../commands/get-users-by-resource.command";
import { UsersService } from "../services/users-service";

export interface GetUsersByResourceHandlerProps {
  usersService: UsersService;
}

export default class GetUsersByResourceHandler implements Handler<GetUsersByResourceCommand> {
  public commandType: string = GET_USERS_BY_RESOURCE_COMMAND_TYPE;

  constructor(private dependencies: GetUsersByResourceHandlerProps) {}

  async execute(command: GetUsersByResourceCommand) {
    return this.dependencies.usersService.getUsersByResource(command.payload);
  }
}

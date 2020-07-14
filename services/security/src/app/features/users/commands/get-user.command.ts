import { Command } from "../../../../../../../shared/command-bus";

export const GET_USER_COMMAND_TYPE = "users/GETUSER";

export interface GetUserCommandPayload {
  userId: string;
  isSuperAdmin: boolean;
}

export class GetUserCommand implements Command<GetUserCommandPayload> {
  public type: string = GET_USER_COMMAND_TYPE;

  constructor(public payload: GetUserCommandPayload) {}
}

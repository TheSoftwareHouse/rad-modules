import { Command } from "../../../../../../../shared/command-bus";

export const ADD_USER_COMMAND_TYPE = "users/ADD_USER";

export interface AddUserCommandPayload {
  username: string;
  password: string;
  attributes?: string[];
}

export class AddUserCommand implements Command<AddUserCommandPayload> {
  public type: string = ADD_USER_COMMAND_TYPE;

  constructor(public payload: AddUserCommandPayload) {}
}

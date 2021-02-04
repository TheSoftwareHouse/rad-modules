import { Command } from "@tshio/command-bus";

export const DELETE_USER_COMMAND_TYPE = "users/DELETEUSER";

export interface DeleteUserCommandPayload {
  userId: string;
}

export class DeleteUserCommand implements Command<DeleteUserCommandPayload> {
  public type: string = DELETE_USER_COMMAND_TYPE;

  constructor(public payload: DeleteUserCommandPayload) {}
}

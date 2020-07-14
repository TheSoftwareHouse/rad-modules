import { Command } from "../../../../../../../shared/command-bus";

export const DEACTIVATE_USER_COMMAND_TYPE = "users/DEACTIVATEUSER";

export interface DeactivateUserCommandPayload {
  userId: string;
}

export class DeactivateUserCommand implements Command<DeactivateUserCommandPayload> {
  public type: string = DEACTIVATE_USER_COMMAND_TYPE;

  constructor(public payload: DeactivateUserCommandPayload) {}
}

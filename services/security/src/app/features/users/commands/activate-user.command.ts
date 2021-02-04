import { Command } from "@tshio/command-bus";

export const ACTIVATE_USER_COMMAND_TYPE = "users/ACTIVATEUSER";

export interface ActivateUserCommandPayload {
  activationToken: string;
}

export class ActivateUserCommand implements Command<ActivateUserCommandPayload> {
  public type: string = ACTIVATE_USER_COMMAND_TYPE;

  constructor(public payload: ActivateUserCommandPayload) {}
}

import { Command } from "../../../../../../../shared/command-bus";

export const ADD_POLICY_COMMAND_TYPE = "users/ADDPOLICY";

export interface AddPolicyCommandPayload {
  resource: string;
  attribute: string;
}

export class AddPolicyCommand implements Command<AddPolicyCommandPayload> {
  public type: string = ADD_POLICY_COMMAND_TYPE;

  constructor(public payload: AddPolicyCommandPayload) {}
}

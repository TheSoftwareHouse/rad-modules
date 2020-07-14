import { Command } from "../../../../../../../shared/command-bus";

export const REMOVE_POLICY_COMMAND_TYPE = "policy/REMOVEPOLICY";

export interface RemovePolicyCommandPayload {
  id?: string;
  resource?: string;
  attribute?: string;
}

export class RemovePolicyCommand implements Command<RemovePolicyCommandPayload> {
  public type: string = REMOVE_POLICY_COMMAND_TYPE;

  constructor(public payload: RemovePolicyCommandPayload) {}
}

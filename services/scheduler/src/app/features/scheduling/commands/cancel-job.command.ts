import { Command } from "@tshio/command-bus";

export const CANCEL_JOB_COMMAND_TYPE = "scheduling/CANCELJOB";

export interface CancelJobCommandPayload {
  id: string;
}

export class CancelJobCommand implements Command<CancelJobCommandPayload> {
  public type: string = CANCEL_JOB_COMMAND_TYPE;

  constructor(public payload: CancelJobCommandPayload) {}
}

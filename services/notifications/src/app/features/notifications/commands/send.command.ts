import { Command } from "../../../../../../../shared/command-bus";

export const SEND_COMMAND_TYPE = "notifications/SEND";

export interface SendCommandPayload {
  channels?: string[];
  message: string;
}

export class SendCommand implements Command<SendCommandPayload> {
  public type: string = SEND_COMMAND_TYPE;

  constructor(public payload: SendCommandPayload) {}
}

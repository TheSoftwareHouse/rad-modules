import { Command } from "@tshio/command-bus";
import { MailMessage } from "../../../../utils/mail-sender";
import { EmailQueuePriority } from "../../../../utils/worker/email-queue";

export const SEND_COMMAND_TYPE = "mailer/SEND";

export interface SendCommandPayload {
  emails: MailMessage[];
  priority: EmailQueuePriority;
}

export class SendCommand implements Command<SendCommandPayload> {
  public type: string = SEND_COMMAND_TYPE;

  constructor(public payload: SendCommandPayload) {}
}

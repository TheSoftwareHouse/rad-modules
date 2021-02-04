import { CommandHandler } from "@tshio/command-bus";
import { SEND_COMMAND_TYPE, SendCommand } from "../commands/send.command";
import { MailSender } from "../../../../utils/mail-sender";
import { EmailQueue, EmailQueuePriority } from "../../../../utils/worker/email-queue";

export type SendHandlerProperties = {
  mailSender: MailSender;
  emailQueue: EmailQueue;
};

export default class SendHandler implements CommandHandler<SendCommand> {
  constructor(private properties: SendHandlerProperties) {}

  public commandType: string = SEND_COMMAND_TYPE;

  async execute(command: SendCommand) {
    // execute body
    const { mailSender, emailQueue } = this.properties;
    const { emails, priority } = command.payload;

    return priority === EmailQueuePriority.URGENT ? mailSender.send(emails) : emailQueue.add(emails);
  }
}

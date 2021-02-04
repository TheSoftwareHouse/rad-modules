import { CommandHandler } from "@tshio/command-bus";
import { SEND_COMMAND_TYPE, SendCommand } from "../commands/send.command";
import { NotificationsBroker } from "../../../../notifications-broker/notifications-broker";

export interface SendHandlerProps {
  notificationsBroker: NotificationsBroker;
}

export default class SendHandler implements CommandHandler<SendCommand> {
  public commandType: string = SEND_COMMAND_TYPE;

  constructor(private dependencies: SendHandlerProps) {}

  async execute(command: SendCommand) {
    const { channels = [], message } = command.payload;
    const notificationsIds = await this.dependencies.notificationsBroker.send(channels, message);

    return { notificationsIds };
  }
}

import { CommandHandler } from "@tshio/command-bus";
import { NotificationsRepository } from "../../../../repositories/notifications.repository";
import { GET_NOTIFICATIONS_COMMAND_TYPE, GetNotificationsCommand } from "../commands/get-notifications.command";

export interface GetNotificationsHandlerProps {
  notificationsRepository: NotificationsRepository;
}

export default class GetNotificationsHandler implements CommandHandler<GetNotificationsCommand> {
  constructor(private dependencies: GetNotificationsHandlerProps) {}

  public commandType: string = GET_NOTIFICATIONS_COMMAND_TYPE;

  async execute(command: GetNotificationsCommand) {
    const { notifications, total } = await this.dependencies.notificationsRepository.getNotifications(command.payload);
    return { notifications, total, page: command.payload.page, limit: command.payload.limit };
  }
}

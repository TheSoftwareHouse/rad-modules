import { EntityRepository, Repository } from "typeorm";
import { NotificationModel } from "../../app/features/notifications/models/notification.model";
import { NotificationsRepository } from "../notifications.repository";

@EntityRepository(NotificationModel)
export class NotificationsTypeormRepository extends Repository<NotificationModel> implements NotificationsRepository {
  public addNotification(notification: NotificationModel) {
    return this.save(notification);
  }

  public addManyNotifications(notifications: NotificationModel[]) {
    return this.save(notifications);
  }

  public async getNotifications() {
    const [notifications, total] = await this.findAndCount({});
    return { notifications, total };
  }
}

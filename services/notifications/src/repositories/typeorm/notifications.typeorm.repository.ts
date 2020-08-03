import { EntityRepository, Repository } from "typeorm";
import { NotificationModel } from "../../app/features/notifications/models/notification.model";
import { NotificationsRepository } from "../notifications.repository";
import { createTypeORMFilter, QueryObject } from "../../../../security/src/repositories/helpers/query-filter";

@EntityRepository(NotificationModel)
export class NotificationsTypeormRepository extends Repository<NotificationModel> implements NotificationsRepository {
  public addNotification(notification: NotificationModel) {
    return this.save(notification);
  }

  public addManyNotifications(notifications: NotificationModel[]) {
    return this.save(notifications);
  }

  public async getNotifications(queryObject: QueryObject) {
    const whereObject = createTypeORMFilter(queryObject, "notification.");
    const [notifications, total] = await this.createQueryBuilder("notification")
      .select("notification")
      .where(whereObject.where, whereObject.operands)
      .skip((queryObject.page - 1) * queryObject.limit)
      .take(queryObject.limit)
      .orderBy(`notification.${queryObject.order.by}`, queryObject.order.type.toUpperCase())
      .cache(true)
      .getManyAndCount();

    return { notifications, total };
  }
}

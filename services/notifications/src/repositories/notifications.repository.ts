import { NotificationModel } from "../app/features/notifications/models/notification.model";
import { QueryObject } from "../../../security/src/repositories/helpers/query-filter";

export interface NotificationsRepository {
  addNotification: (notification: NotificationModel) => Promise<NotificationModel>;
  addManyNotifications: (notification: NotificationModel[]) => Promise<NotificationModel[]>;
  getNotifications: (payload: QueryObject) => Promise<{ notifications: NotificationModel[]; total: number }>;
}

import { NotificationModel } from "../app/features/notifications/models/notification.model";

export interface NotificationsRepository {
  addNotification: (notification: NotificationModel) => Promise<NotificationModel>;
  addManyNotifications: (notification: NotificationModel[]) => Promise<NotificationModel[]>;
  getNotifications: () => Promise<{ notifications: NotificationModel[]; total: number }>;
}

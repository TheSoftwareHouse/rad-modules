import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, Index } from "typeorm";

interface NotificationModelProps {
  channel: string;
  message: string;
}

@Entity({
  name: "Notification",
})
export class NotificationModel {
  public static create(data: Partial<NotificationModelProps>): NotificationModel {
    const entity = new NotificationModel();
    Object.assign(entity, data);

    return entity;
  }

  public static createMany(channels: string[], message: string): NotificationModel[] {
    const entities = channels.map((channel) => {
      const entity = new NotificationModel();
      Object.assign(entity, { channel, message });

      return entity;
    });

    return entities;
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ nullable: false })
  channel: string;

  @Column({ nullable: false })
  message: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;
}
